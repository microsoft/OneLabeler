from copy import deepcopy
from typing import Any, List, Tuple, Union

import cv2 as cv
import numpy as np
from sklearn.base import BaseEstimator
from sklearn.decomposition import PCA
from sklearn.dummy import DummyClassifier
from sklearn.exceptions import NotFittedError
from skimage.feature import greycomatrix, greycoprops
from skimage.filters import sobel
from sklearn.linear_model import LogisticRegression
from skimage.measure import shannon_entropy
from sklearn.neural_network import BernoulliRBM
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.semi_supervised import LabelSpreading
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

from .generic import GenericPipeline
from .types import DefaultLabelingModelType, Label, Model, Status

ListLike = Union[List[Any], np.ndarray]


def random_sampling(data_objects: ListLike,
                    statuses: np.ndarray,
                    n_batch: int) -> np.ndarray:
    """
    Random sample unlabeled data objects.
    Skipped data objects have lower priorities.

    Args
    ----
    data_objects : np.ndarray or list of any values, length = n_pool
        The whole list of data objects, no matter labeled or unlabeled.
    statuses : np.ndarray of any values, dtype = objects, shape = (n_pool,)
        The label statuses of the data objects.
        Each entry takes value in
        [Status.NEW, Status.VIEWED, Status.SKIPPED, Status.LABELED].
    n_batch : int
        The number of data objects to sample.

    Returns
    -------
    query_indices : np.ndarray of int values, shape = (n_batch,)
        The indices of the sampled data objects in the whole list.
    """

    del data_objects  # unused argument

    unlabeled_indices = np.where(statuses == Status.NEW)[0]
    if len(unlabeled_indices) <= n_batch:
        query_indices = unlabeled_indices
        skipped_indices = np.where(statuses == Status.SKIPPED)[0]
        n_residue = n_batch - len(query_indices)
        query_indices_skipped = skipped_indices if len(skipped_indices) <= n_residue\
            else np.random.choice(skipped_indices, size=n_residue, replace=False)
        query_indices = np.concatenate((query_indices, query_indices_skipped))
    else:
        query_indices = np.random.choice(unlabeled_indices,
                                         size=n_batch, replace=False)
    return query_indices


def feature_extraction_handcraft(imgs: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """
    Extract handcrafted features for each image.

    Args
    ----
    imgs : np.ndarray
        The images to extract features.

    Returns
    -------
    X : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.
    """

    feature_names = [
        'entropy',
        'grey_hist',
        'edge_hist',
        'contrast',
        'dissimilarity',
        'energy',
    ]

    entropies = []
    grey_hists = []
    edge_hists = []
    contrasts = []
    dissimilarities = []
    energies = []
    for img in imgs:
        img_gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

        # Feature 1: entropy
        entropy = shannon_entropy(img_gray)
        entropies.append(entropy)

        # Feature 2: grey scale histogram projection first component
        hist, _ = np.histogram(img_gray, bins=10, range=(0, 255))
        grey_hists.append(hist)

        # Feature 3: edge histogram projection first component
        img_sobel = sobel(img_gray)
        hist, _ = np.histogram(img_sobel, bins=10, range=(0, 1))
        edge_hists.append(hist)

        # Feature 4: grey level co-occurrence matrix contrast
        glcm = greycomatrix(img_gray, distances=[5], angles=[0],
                            levels=256, symmetric=True, normed=True)
        contrast = greycoprops(glcm, 'contrast')[0][0]
        contrasts.append(contrast)

        # Feature 5: grey level co-occurrence matrix dissimilarity
        dissimilarity = greycoprops(glcm, 'dissimilarity')[0][0]
        dissimilarities.append(dissimilarity)

        # Feature 6: grey level co-occurrence matrix energy
        energy = greycoprops(glcm, 'energy')[0][0]
        energies.append(energy)

    grey_hist_projections = PCA(n_components=1).fit_transform(grey_hists)[:, 0]
    edge_hist_projections = PCA(n_components=1).fit_transform(edge_hists)[:, 0]

    n_samples = len(imgs)
    n_features = len(feature_names)
    X = np.zeros(shape=(n_samples, n_features))
    X[:, 0] = entropies
    X[:, 1] = grey_hist_projections
    X[:, 2] = edge_hist_projections
    X[:, 3] = contrasts
    X[:, 4] = dissimilarities
    X[:, 5] = energies

    return X, feature_names


def feature_extraction_flatten(imgs: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for each image by simply flattening the image.

    Args
    ----
    imgs : np.ndarray
        The images to extract features.

    Returns
    -------
    X : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.
    """

    h, w = 8, 8
    imgs_resized = []
    for img in imgs:
        img_gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        img_resized = cv.resize(img_gray, (h, w), interpolation=cv.INTER_AREA)
        imgs_resized.append(img_resized)
    imgs_resized = np.array(imgs_resized)
    n_samples = len(imgs)
    X = imgs_resized.reshape((n_samples, h * w))
    feature_names = []
    for i in range(h):
        for j in range(w):
            feature_names.append(f'({i}, {j})')
    return X, feature_names


class EstimatorWithLabelDecoder(BaseEstimator):
    def __init__(self, estimator: BaseEstimator, encoder: LabelEncoder):
        self.estimator = estimator
        self.encoder = encoder

    def predict(self, X: np.ndarray) -> np.ndarray:
        y_pred = self.estimator.predict(X)
        y_pred_decoded = self.encoder.inverse_transform(y_pred)
        return y_pred_decoded

class DataLabelingPipeline(GenericPipeline):
    @staticmethod
    def extract_features(data_objects: ListLike) -> Tuple[ListLike, List[str]]:
        data_objects = deepcopy(data_objects)
        imgs = []
        for data_object in data_objects:
            path = data_object['path']
            img = cv.imread(path)
            imgs.append(img)
            data_object['width'] = img.shape[1]
            data_object['height'] = img.shape[0]
        imgs = np.array(imgs)
        #X, feature_names = feature_extraction_handcraft(imgs)
        X, feature_names = feature_extraction_flatten(imgs)
        for i, data_object in enumerate(data_objects):
            data_objects[i]['features'] = X[i]
        return data_objects, feature_names

    @staticmethod
    def sample_data_objects(data_objects: ListLike,
                            statuses: np.ndarray,
                            n_batch: int) -> np.ndarray:
        query_indices = random_sampling(data_objects, statuses, n_batch)
        return query_indices

    @staticmethod
    def assign_default_labels(data_objects: ListLike,
                              model: Model,
                              classes: np.ndarray,
                              unlabeled_mark: Label) -> np.ndarray:
        if len(data_objects) == 0:
            return np.array([])
        
        X = np.array([data_object['features'] for data_object in data_objects])
        n_samples = len(data_objects)
        if model.type == DefaultLabelingModelType.Null:
            default_labels = np.array([unlabeled_mark for i in range(n_samples)], dtype=str)
        elif model.type == DefaultLabelingModelType.Random:
            default_labels = np.random.choice(classes, size=n_samples, replace=True)
        elif model.content is None:
            default_labels = np.random.choice(classes, size=n_samples, replace=True)
        else:
            try:
                default_labels = model.content.predict(X)
            except NotFittedError as e:
                default_labels = np.random.choice(classes, size=n_samples, replace=True)

        return default_labels

    @staticmethod
    def update_model(data_objects: ListLike,
                     labels: np.ndarray,
                     statuses: np.ndarray,
                     model: Model) -> Model:
        """
        Args
        ----
        labels : np.ndarray of string values
        """
        
        assert model.type in [
            DefaultLabelingModelType.Null,
            DefaultLabelingModelType.Random,
            DefaultLabelingModelType.DecisionTree,
            DefaultLabelingModelType.SVM,
            DefaultLabelingModelType.LogisticRegression,
            DefaultLabelingModelType.LabelSpreading,
            DefaultLabelingModelType.RestrictedBoltzmannMachine,
        ], f'Invalid model type: {model.type}'
        
        X = np.array([data_object['features'] for data_object in data_objects])
        mask_labeled = np.array([status == Status.LABELED for status in statuses])
        if np.sum(mask_labeled) == 0:
            return model

        unlabeled_indices = np.where(~mask_labeled)[0]
        if len(unlabeled_indices) != 0:
            unlabeled_mark = labels[unlabeled_indices[0]]
            classes = np.array([d for d in np.unique(labels) if d != unlabeled_mark])
            encoder = LabelEncoder().fit(classes)
            y = np.zeros(len(labels), dtype=int)
            y[mask_labeled] = encoder.transform(labels[mask_labeled])
            y[~mask_labeled] = -1
        else:
            classes = np.unique(y)
            encoder = LabelEncoder().fit(classes)
            y = encoder.transform(labels)

        X_train = X[mask_labeled]
        y_train = y[mask_labeled]

        if model.type == DefaultLabelingModelType.Null:
            content = None
        elif model.type == DefaultLabelingModelType.Random:
            content = None
        elif model.type == DefaultLabelingModelType.DecisionTree:
            not_fitted = model.content is None
            estimator = DecisionTreeClassifier() if not_fitted\
                else model.content.estimator
            estimator = estimator.fit(X_train, y_train)
            content = EstimatorWithLabelDecoder(estimator=estimator, encoder=encoder)
        elif model.type == DefaultLabelingModelType.SVM:
            # sklearn.svm.SVC doesn't support the edge case with one class
            if len(np.unique(y_train)) == 1:
                estimator = DummyClassifier(strategy='most_frequent')
            else:
                not_fitted = model.content is None\
                    or model.content.estimator.__class__.__name__ == 'DummyClassifier'
                estimator = SVC(gamma=0.001) if not_fitted\
                    else model.content.estimator
            estimator = estimator.fit(X_train, y_train)
            content = EstimatorWithLabelDecoder(estimator=estimator, encoder=encoder)
        elif model.type == DefaultLabelingModelType.LogisticRegression:
            # sklearn.linear_model.LogisticRegression doesn't support the edge case with one class
            if len(np.unique(y_train)) == 1:
                estimator = DummyClassifier(strategy='most_frequent')
            else:
                not_fitted = model.content is None\
                    or model.content.estimator.__class__.__name__ == 'DummyClassifier'
                estimator = make_pipeline(
                    StandardScaler(),
                    LogisticRegression(C=1, penalty='l2', tol=0.01, solver='saga'),
                ) if not_fitted else model.content.estimator
            estimator = estimator.fit(X_train, y_train)
            content = EstimatorWithLabelDecoder(estimator=estimator, encoder=encoder)
        elif model.type == DefaultLabelingModelType.LabelSpreading:
            not_fitted = model.content is None
            estimator = LabelSpreading(gamma=0.25, max_iter=20) if not_fitted\
                else model.content.estimator
            estimator = estimator.fit(X, y)
            content = EstimatorWithLabelDecoder(estimator=estimator, encoder=encoder)
        elif model.type == DefaultLabelingModelType.RestrictedBoltzmannMachine:
            # sklearn.neural_network.BernoulliRBM doesn't support the edge case with one class
            if len(np.unique(y_train)) == 1:
                estimator = DummyClassifier(strategy='most_frequent')
            else:
                not_fitted = model.content is None\
                    or model.content.estimator.__class__.__name__ == 'DummyClassifier'
                estimator = make_pipeline(
                    BernoulliRBM(random_state=0),
                    LogisticRegression(solver='newton-cg', tol=1),
                ) if not_fitted else model.content.estimator
            estimator = estimator.fit(X_train, y_train)
            content = EstimatorWithLabelDecoder(estimator=estimator, encoder=encoder)

        model_updated = Model(
            type=model.type,
            content=content,
        )
        return model_updated
