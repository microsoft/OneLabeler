"""
Functions for dumping and loading data.
"""

from typing import Any, Optional
import pickle
import time

import pymongo
from bson.objectid import ObjectId


# pylint: disable=pointless-string-statement
"""
Whether to mock the database with a dict.
"""
MOCK = True


def save(data: Any,
         name: Optional[str] = None,
         url: Optional[str] = None,
         db_name: Optional[str] = None,
         collection_name: Optional[str] = None,
         inserted_id: Optional[ObjectId] = None) -> dict:
    """
    Save data to mongodb.

    Args
    ----
    data : Any
        The data to be dumped.
    name : str, optional
        The name of the data object.
    url : str, optional
        The url for connecting the mongo client.
        Needed only when the db is not mocked.
    db_name : str, optional
        The name of the database.
        Needed only when the db is not mocked.
    collection_name : str
        The name of the data collection in the database.
        Needed only when the db is not mocked.
    inserted_id : ObjectId, optional
        The id to store/update the data.
        When not given, the data will be stored at a new unique id.

    Returns
    -------
    details : dict
        The details of the storage.
        Has form {'inserted_id': ObjectId, 'name': str, 'created_time': float}.
    """
    # pylint: disable=too-many-arguments

    if not MOCK:
        return save_to_db(data, name, url, db_name,
                          collection_name, inserted_id)
    return save_to_dict(data, name, inserted_id)


def load(inserted_id: ObjectId,
         url: Optional[str] = None,
         db_name: Optional[str] = None,
         collection_name: Optional[str] = None) -> Any:
    """
    Load data from mongodb.

    Args
    ----
    inserted_id : ObjectId
        The key to the data object in the database.
    url : str, optional
        The url for connecting the mongo client.
        Needed only when the db is not mocked.
    db_name : str, optional
        The name of the database.
        Needed only when the db is not mocked.
    collection_name : str, optional
        The name of the data collection in the database.
        Needed only when the db is not mocked.

    Returns
    -------
    data : Any
        The stored data.
    """

    if not MOCK:
        return load_from_db(inserted_id, url, db_name, collection_name)
    return load_from_dict(inserted_id)


def is_saved(inserted_id: ObjectId,
             url: Optional[str] = None,
             db_name: Optional[str] = None,
             collection_name: Optional[str] = None) -> Any:
    """
    Check if data is saved in mongodb.

    Args
    ----
    inserted_id : ObjectId
        The key to the data object possibly in the database.
    url : str
        The url for connecting the mongo client.
    db_name : str
        The name of the database.
    collection_name : str
        The name of the data collection in the database.

    Returns
    -------
    is_saved : bool
        Whether the data is saved.
    """
    # pylint: disable=invalid-name

    if not MOCK:
        return is_saved_in_db(inserted_id, url, db_name, collection_name)
    return is_saved_in_dict(inserted_id)


def save_to_db(data: Any,
               name: str,
               url: str,
               db_name: str,
               collection_name: str,
               inserted_id: Optional[ObjectId] = None) -> dict:
    """
    Save data to mongodb.

    Args
    ----
    data : Any
        The data to be dumped.
    name : str
        The name of the data object.
    url : str
        The url for connecting the mongo client.
    db_name : str
        The name of the database.
    collection_name : str
        The name of the data collection in the database.
    inserted_id : ObjectId, optional
        The id to store/update the data.
        When not given, the data will be stored at a new unique id.

    Returns
    -------
    details : dict
        The details of the storage.
        Has form {'inserted_id': ObjectId, 'name': str, 'created_time': float}.
    """
    # pylint: disable=too-many-arguments
    # pylint: disable=invalid-name

    pickled_data = pickle.dumps(data)

    # create connection
    client = pymongo.MongoClient(url)

    # create database
    db = client[db_name]

    # create collection
    collection = db[collection_name]

    payload = {
        'data': pickled_data,
        'name': name,
        'created_time': time.time()
    }

    # save data
    if inserted_id is None:
        info = collection.insert_one(payload)
        inserted_id = info.inserted_id
    else:
        info = collection.update_one(
            {'_id': inserted_id},
            {'$set': payload}, upsert=True)

    details = {
        'inserted_id': inserted_id,
        'name': name,
        'created_time': time.time()
    }

    return details


def load_from_db(inserted_id: ObjectId,
                 url: str,
                 db_name: str,
                 collection_name: str) -> Any:
    """
    Load data from mongodb.

    Args
    ----
    inserted_id : ObjectId
        The key to the data object in the database.
    url : str
        The url for connecting the mongo client.
    db_name : str
        The name of the database.
    collection_name : str
        The name of the data collection in the database.

    Returns
    -------
    data : Any
        The stored data.
    """
    # pylint: disable=invalid-name

    # create connection
    client = pymongo.MongoClient(url)

    # get database
    db = client[db_name]

    # get collection
    collection = db[collection_name]

    # get data
    data = collection.find_one({'_id': inserted_id})
    pickled_data = data['data']

    data = pickle.loads(pickled_data)
    return data


def is_saved_in_db(inserted_id: ObjectId,
                   url: str,
                   db_name: str,
                   collection_name: str) -> Any:
    """
    Check if data is saved in mongodb.

    Args
    ----
    inserted_id : ObjectId
        The key to the data object possibly in the database.
    url : str
        The url for connecting the mongo client.
    db_name : str
        The name of the database.
    collection_name : str
        The name of the data collection in the database.

    Returns
    -------
    is_saved : bool
        Whether the data is saved.
    """
    # pylint: disable=invalid-name

    # create connection
    client = pymongo.MongoClient(url)

    # get database
    db = client[db_name]

    # get collection
    collection = db[collection_name]

    # get data
    data = collection.find_one({'_id': inserted_id})
    return data is None


# pylint: disable=pointless-string-statement
"""
A dict simulating the database.

Note
----
Saving and fetching data from the dict is much faster than from db.
"""
DB = {}


def save_to_dict(data: Any,
                 name: Optional[str] = None,
                 inserted_id: Optional[ObjectId] = None) -> dict:
    """
    Save data to database mocked with a dict.

    Args
    ----
    data : Any
        The data to be dumped.
    name : str
        The name of the data object.
    inserted_id : ObjectId, optional
        The id to store/update the data.
        When not given, the data will be stored at a new unique id.

    Returns
    -------
    details : dict
        The details of the storage.
        Has form {'inserted_id': ObjectId, 'name': str, 'created_time': float}.
    """

    if inserted_id is None:
        inserted_id = ObjectId()

    DB[inserted_id] = data
    details = {
        'inserted_id': inserted_id,
        'name': name,
        'created_time': time.time()
    }
    return details


def load_from_dict(inserted_id: ObjectId) -> Any:
    """
    Load data from database mocked with a dict.

    Args
    ----
    inserted_id : ObjectId
        The key to the data object in the database.

    Returns
    -------
    data : Any
        The stored data.
    """

    data = DB[inserted_id]
    return data


def is_saved_in_dict(inserted_id: ObjectId) -> Any:
    """
    Check if data is saved in database mocked with dict.

    Args
    ----
    inserted_id : ObjectId
        The key to the data object possibly in the database.

    Returns
    -------
    is_saved : bool
        Whether the data is saved.
    """
    # pylint: disable=invalid-name

    return inserted_id in DB
