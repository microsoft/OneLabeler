// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * RPC Style API for data objects.
 * 
 * All the apis are idempotent.
 * 
 * POST /dataObjects/count?auth={auth}
 *  Get the number of data objects.
 * POST /dataObjects/deleteAll?auth={auth}
 *  Delete all the data objects.
 * POST /dataObjects/get?auth={auth}
 *  Get a data object by uuid.
 * POST /dataObjects/getAll?auth={auth}
 *  Get all the data objects.
 * POST /dataObjects/getBulk?auth={auth}
 *  Get a bulk of data objects by uuids.
 * POST /dataObjects/slice?auth={auth}
 *  Get a slice of the data objects.
 * POST /dataObjects/upsert?auth={auth}
 *  Upsert a data object by uuid.
 * POST /dataObjects/upsertBulk?auth={auth}
 *  Upsert a bulk of data objects by uuids.
 * POST /dataObjects/uuids?auth={auth}
 *  Get the uuids of all the data objects.
 */

import { Router } from 'express';
import { IDataObject, IDataObjectStorage } from '../commons/types';

const factory = (
  dataObjects: IDataObjectStorage,
  secrete: string,
): Router => {
  const router = Router();

  /**
   * /dataObjects/count?auth={auth}:
   *   post:
   *     description: Get the number of data objects.
   *     responses:
   *       200:
   *         description: The number.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the number.
   */
  router.post('/count', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);

    dataObjects.count()
      .then((count) => {
        res.json(count);
        next();
      })
      .catch((reason) => {
        res.sendStatus(500);
        next(reason);
      });
  });

  /**
   * /dataObjects/deleteAll?auth={auth}:
   *   post:
   *     description: Delete all the data objects (idempotent).
   *     responses:
   *       204:
   *         description: Deleted.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to delete.
   */
  router.post('/deleteAll', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);

    dataObjects.deleteAll()
      .then(() => {
        res.sendStatus(204);
        next();
      })
      .catch((reason) => {
        res.sendStatus(500);
        next(reason);
      });
  });

  /**
   * /dataObjects/get?auth={auth}:
   *   post:
   *     description: Get a data object by uuid.
   *     responses:
   *       200:
   *         description: A data object.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the data object.
   */
  router.post('/get', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuid: string = req.body.uuid;

    dataObjects.get(uuid)
      .then((value) => {
        // Note: Undefined is not json.
        // Thus, need to transform to null.
        res.json(value === undefined ? null : value)
        next();
      })
      .catch((reason) => {
        res.sendStatus(500);
        next(reason);
      });
  });

  /**
   * /dataObjects/getAll?auth={auth}:
   *   post:
   *     description: Get all the data objects.
   *     responses:
   *       200:
   *         description: All the data objects.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the data objects.
   */
  router.post('/getAll', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);

    dataObjects.getAll()
      .then((values) => {
        // Note: trying to send extremely large data object list
        // may raise "RangeError: Invalid string length" at JSON.stringify.
        // The maximum string size JSON.stringify can handle is ~ 1GB.
        res.json(values);
        next();
      })
      .catch((reason) => {
        res.sendStatus(500);
        next(reason);
      });
  });

  /**
   * /dataObjects/getBulk?auth={auth}:
   *   post:
   *     description: Get a bulk of data objects by uuids.
   *     responses:
   *       200:
   *         description: A bulk of data objects.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the data objects.
   */
  router.post('/getBulk', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuids: string[] = req.body.uuids;

    dataObjects.getBulk(uuids)
      .then((values) => {
        // Note: Undefined is not json.
        // When json stringify undefined entry of an array,
        // it will be transformed to null.
        res.json(values);
        next();
      })
      .catch((reason) => {
        res.sendStatus(500);
        next(reason);
      });
  });

  /**
   * /dataObjects/slice?auth={auth}:
   *   post:
   *     description: Get a slice of the data objects.
   *     responses:
   *       200:
   *         description: A slice of the data objects.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the data objects.
   */
  router.post('/slice', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const begin: number | undefined = req.body.begin;
    const end: number | undefined = req.body.end;

    dataObjects.slice(begin, end)
      .then((values) => {
        res.json(values);
        next();
      })
      .catch((reason) => {
        res.sendStatus(500);
        next(reason);
      });
  });

  /**
   * /dataObjects/upsert?auth={auth}:
   *   post:
   *     description: Upsert a data object by uuid (idempotent).
   *     responses:
   *       204:
   *         description: Upserted.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to upsert.
   */
  router.post('/upsert', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const value: IDataObject = req.body.value;

    dataObjects.upsert(value)
      .then(() => {
        res.sendStatus(204);
        next();
      })
      .catch((reason) => {
        res.sendStatus(500);
        next(reason);
      });
  });

  /**
   * /dataObjects/upsertBulk?auth={auth}:
   *   post:
   *     description: Upsert a bulk of data objects by uuids (idempotent).
   *     responses:
   *       207:
   *         description: Bulk upserted.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to upsert.
   */
  router.post('/upsertBulk', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const values: IDataObject[] = req.body.values;

    dataObjects.upsertBulk(values)
      .then(() => {
        res.sendStatus(207);
        next();
      })
      .catch((reason) => {
        res.sendStatus(500);
        next(reason);
      });
  });

  /**
   * /dataObjects/uuids?auth={auth}:
   *   post:
   *     description: Get the uuids of all the data objects.
   *     responses:
   *       200:
   *         description: The uuids.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get uuids.
   */
  router.post('/uuids', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);

    dataObjects.uuids()
      .then((uuids) => {
        res.json(uuids);
        next();
      })
      .catch((reason) => {
        res.sendStatus(500);
        next(reason);
      });
  });

  return router;
};

export default factory;
