import express from 'express';
import cors from 'cors';
import {
  dataObjectDB as dataObjectStorage,
  labelDB as labelStorage,
  statusDB as statusStorage,
} from './database';
import {
  IDataObject,
  ILabel,
  IStatus,
} from './types';
import { FilterQuery } from 'mongoose';

const PORT = 8887;
const app = express();

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true }));
app.post('/database/:storage/:op', async (req, res, next) => {
  const { storage, op } = req.params;
  if (storage === 'dataObjects') {
    if (op === 'add') {
      const value = req.body.value as IDataObject;
      await dataObjectStorage.add(value);
      res.send();
    } else if (op === 'count') {
      const count = await dataObjectStorage.count();
      res.json(count);
    } else if (op === 'deleteAll') {
      await dataObjectStorage.deleteAll();
      res.send();
    } else if (op === 'get') {
      const uuid = req.body.uuid as string;
      const value = await dataObjectStorage.get(uuid);
      res.json(value === undefined ? null : value);
    } else if (op === 'getBulk') {
      const uuids = req.body.uuids as string[];
      const values = await dataObjectStorage.getBulk(uuids);
      res.json(values);
    } else if (op === 'getAll') {
      const values = await dataObjectStorage.getAll();
      res.json(values);
    } else if (op === 'set') {
      const value = req.body.value as IDataObject;
      await dataObjectStorage.set(value);
      res.send();
    } else if (op === 'setBulk') {
      const values = req.body.values as IDataObject[];
      await dataObjectStorage.setBulk(values);
      res.send();
    } else if (op === 'slice') {
      const { begin, end } = req.body as { begin?: number, end?: number };
      const values = await dataObjectStorage.slice(begin, end);
      res.json(values);
    } else if (op === 'uuids') {
      const uuids = await dataObjectStorage.uuids();
      res.json(uuids);
    }
  } else if (storage === 'labels') {
    if (op === 'count') {
      const query = req.body.query as FilterQuery<unknown> | undefined;
      const count = await labelStorage.count(query);
      res.json(count);
    } else if (op === 'deleteAll') {
      await labelStorage.deleteAll();
      res.send();
    } else if (op === 'get') {
      const uuid = req.body.uuid as string;
      const value = await labelStorage.get(uuid);
      res.json(value === undefined ? null : value);
    } else if (op === 'getBulk') {
      const uuids = req.body.uuids as string[];
      const values = await labelStorage.getBulk(uuids);
      res.json(values);
    } else if (op === 'getAll') {
      const values = await labelStorage.getAll();
      res.json(values);
    } else if (op === 'getFiltered') {
      const query = req.body.query as FilterQuery<unknown>;
      const values = await labelStorage.getFiltered(query);
      res.json(values);
    } else if (op === 'set') {
      const value = req.body.value as ILabel;
      await labelStorage.set(value);
      res.send();
    } else if (op === 'setBulk') {
      const values = req.body.values as ILabel[];
      await labelStorage.setBulk(values);
      res.send();
    }
  } else if (storage === 'statuses') {
    if (op === 'count') {
      const query = req.body.query as FilterQuery<unknown> | undefined;
      const count = await statusStorage.count(query);
      res.json(count);
    } else if (op === 'deleteAll') {
      await statusStorage.deleteAll();
      res.send();
    } else if (op === 'get') {
      const uuid = req.body.uuid as string;
      const value = await statusStorage.get(uuid);
      res.json(value === undefined ? null : value);
    } else if (op === 'getBulk') {
      const uuids = req.body.uuids as string[];
      const values = await statusStorage.getBulk(uuids);
      res.json(values);
    } else if (op === 'getAll') {
      const values = await statusStorage.getAll();
      res.json(values);
    } else if (op === 'set') {
      const value = req.body.value as IStatus;
      await statusStorage.set(value);
      res.send();
    } else if (op === 'setBulk') {
      const values = req.body.values as IStatus[];
      await statusStorage.setBulk(values);
      res.send();
    }
  }
  next();
});
app.listen(PORT);

console.log(`Development server is running at http://127.0.0.1:${PORT}/`);
