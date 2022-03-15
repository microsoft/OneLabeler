// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import express from 'express';
import cors from 'cors';
import StorageStore from './database';
import dataObjectsRPCFactory from './api/dataObjects-rpc';
import dataObjectsRestFactory from './api/dataObjects-rest';
import labelsRPCFactory from './api/labels-rpc';
import labelsRestFactory from './api/labels-rest';
import statusesRPCFactory from './api/statuses-rpc';
import statusesRestFactory from './api/statuses-rest';

const PORT = 8887;
const SECRETE = 'UKBumAJziW5eL8t';

const storage = new StorageStore();
storage.init().then(() => {
  const app = express();

  app.use(cors());
  app.use(express.json({limit: '50mb'}));
  app.use(express.urlencoded({ extended: true }));
  app.use('/dataObjects', dataObjectsRPCFactory(storage.dataObjects, SECRETE));
  app.use('/dataObjects', dataObjectsRestFactory(storage.dataObjects, SECRETE));
  app.use('/labels', labelsRPCFactory(storage.labels, SECRETE));
  app.use('/labels', labelsRestFactory(storage.labels, SECRETE));
  app.use('/statuses', statusesRPCFactory(storage.statuses, SECRETE));
  app.use('/statuses', statusesRestFactory(storage.statuses, SECRETE));

  // support timing of round trip between client and server
  app.use('/roundtrip', (req, res, next) => res.end());
  app.listen(PORT);

  console.log(`Development server is running at http://127.0.0.1:${PORT}/`);
});
