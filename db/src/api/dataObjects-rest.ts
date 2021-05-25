/**
 * REST Style API for data objects.
 * 
 * All the apis are idempotent.
 * 
 * GET /dataObjects/count?auth={auth}
 *  Get the number of data objects.
 * DELETE /dataObjects/items?auth={auth}
 *  Delete all the data objects.
 * GET /dataObjects/items/{uuid}?auth={auth}
 *  Get a data object by uuid.
 * GET /dataObjects/items?begin={begin}&end={end}&auth={auth}
 *  Get the data objects (with optional slicing).
 * GET /dataObjects/bulk?auth={auth}
 *  Get a bulk of data objects by uuids.
 * PUT /dataObjects/items/{uuid}?auth={auth}
 *  Upsert a data object by uuid.
 * PUT /dataObjects/bulk?auth={auth}
 *  Upsert a bulk of data objects by uuids.
 * GET /dataObjects/uuids?auth={auth}
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
   *   get:
   *     description: Get the number of data objects.
   *     responses:
   *       200:
   *         description: The number.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the number.
   * example: http://localhost:8887/dataObjects/count?auth=UKBumAJziW5eL8t
   */
  router.get('/count', (req, res, next) => {
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
   * /dataObjects/items?auth={auth}:
   *   delete:
   *     description: Delete all the data objects (idempotent).
   *     responses:
   *       204:
   *         description: Deleted.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to delete.
   */
  router.delete('/items', (req, res, next) => {
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
   * /dataObjects/items/{uuid}?auth={auth}:
   *   get:
   *     description: Get a data object by uuid.
   *     responses:
   *       200:
   *         description: A data object.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the data object.
   * example: http://localhost:8887/dataObjects/items/13073517-dd3c-45c6-8015-80e72dcb4310?auth=UKBumAJziW5eL8t
   */
  router.get('/items/:uuid', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuid: string = req.params.uuid;

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
   * /dataObjects/items?begin={begin}&end={end}&auth={auth}:
   *   get:
   *     description: Get the data objects (with optional slicing).
   *     responses:
   *       200:
   *         description: The data objects.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the data objects.
   *  example: http://localhost:8887/dataObjects/items?auth=UKBumAJziW5eL8t
   *  example: http://localhost:8887/dataObjects/items?auth=UKBumAJziW5eL8t&begin=1500&end=1510
   */
  router.get('/items', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    let begin: number | undefined = Number(req.query.begin);
    if (isNaN(begin)) begin = undefined;
    let end: number | undefined = Number(req.query.end);
    if (isNaN(end)) end = undefined;

    const promiseDataObjects = (begin === undefined && end === undefined)
      ? dataObjects.getAll()
      : dataObjects.slice(begin, end);
    promiseDataObjects
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
   * /dataObjects/bulk?auth={auth}:
   *   get:
   *     description: Get a bulk of data objects by uuids.
   *     responses:
   *       200:
   *         description: A bulk of data objects.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the data objects.
   */
  router.get('/bulk', (req, res, next) => {
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
   * /dataObjects/items/{uuid}?auth={auth}:
   *   put:
   *     description: Upsert a data object by uuid (idempotent).
   *     responses:
   *       204:
   *         description: Upserted.
   *       400:
   *         description: uuid in parameter and in and data object mismatch.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to upsert.
   */
  router.put('/items/:uuid', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuid: string = req.params.uuid;
    const value: IDataObject = req.body.value;
    if (uuid !== value.uuid) return res.sendStatus(400);

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
   * /dataObjects/bulk?auth={auth}:
   *   put:
   *     description: Upsert a bulk of data objects by uuids (idempotent).
   *     responses:
   *       207:
   *         description: Bulk upserted.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to upsert.
   */
  router.put('/bulk', (req, res, next) => {
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
   *   get:
   *     description: Get the uuids of all the data objects.
   *     responses:
   *       200:
   *         description: The uuids.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get uuids.
   * example: http://localhost:8887/dataObjects/uuids?auth=UKBumAJziW5eL8t
   */
  router.get('/uuids', (req, res, next) => {
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
