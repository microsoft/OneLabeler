import ObjectId from 'bson-objectid';
import type { ModelService } from '@/commons/types';

const modelServices: ModelService[] = [{
  type: 'DecisionTree',
  label: 'DecisionTree (Supervised)',
  objectId: (new ObjectId('DecisionTree')).toHexString(),
  isBuiltIn: true,
  isServerless: false,
  isValidSampler: false,
  // id: 'DecisionTree-95912701',
  // api: `${ALGORITHM_URL}/model/DecisionTree`,
  // isLocal: true,
}, {
  type: 'SVM',
  label: 'SVM (Supervised)',
  objectId: (new ObjectId('SVM000000000')).toHexString(),
  isBuiltIn: true,
  isServerless: false,
  isValidSampler: false,
  // id: 'SVM-99885399',
  // api: `${ALGORITHM_URL}/model/SVM`,
  // isLocal: true,
}, {
  type: 'LogisticRegression',
  label: 'LogisticRegression (Supervised)',
  objectId: (new ObjectId('LogisticRegr')).toHexString(),
  isBuiltIn: true,
  isServerless: false,
  isValidSampler: true,
  // id: 'LogisticRegression-75095119',
  // api: `${ALGORITHM_URL}/model/LogisticRegression`,
  // isLocal: true,
}, {
  type: 'RestrictedBoltzmannMachine',
  label: 'RestrictedBoltzmannMachine (Supervised)',
  objectId: (new ObjectId('RestrictedBo')).toHexString(),
  isBuiltIn: true,
  isServerless: false,
  isValidSampler: false,
  // id: 'RestrictedBoltzmannMachine-73157581',
  // api: `${ALGORITHM_URL}/model/RestrictedBoltzmannMachine`,
  // isLocal: true,
}, {
  type: 'LabelSpreading',
  label: 'LabelSpreading (Semi-Supervised)',
  objectId: (new ObjectId('LabelSpreadi')).toHexString(),
  isBuiltIn: true,
  isServerless: false,
  isValidSampler: true,
  // id: 'LabelSpreading-81419641',
  // api: `${ALGORITHM_URL}/model/LabelSpreading`,
  // isLocal: true,
}];

export default modelServices;
