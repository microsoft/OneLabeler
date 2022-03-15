// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * RPC Style API for statuses.
 * 
 * All the apis are idempotent.
 * 
 * POST /statuses/count?auth={auth}
 *  Get the number of statuses (with optional filtering).
 * POST /statuses/deleteAll?auth={auth}
 *  Delete all the statuses.
 * POST /statuses/get?auth={auth}
 *  Get a label by uuid.
 * POST /statuses/getAll?auth={auth}
 *  Get all the statuses.
 * POST /statuses/getBulk?auth={auth}
 *  Get a bulk of statuses by uuids.
 * POST /statuses/getFiltered?auth={auth}
 *  Get all the statuses with filtering.
 * POST /statuses/upsert?auth={auth}
 *  Upsert a label by uuid.
 * POST /statuses/upsertBulk?auth={auth}
 *  Upsert a bulk of statuses by uuids.
 */

import { Router } from 'express';
import { FilterQuery } from 'mongoose';
import { IStatus, IStatusStorage } from '../commons/types';

const factory = (
  statuses: IStatusStorage,
  secrete: string,
): Router => {
  const router = Router();

  /**
   * /statuses/count?auth={auth}:
   *   post:
   *     description: Get the number of statuses (with optional filtering).
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
    const query: FilterQuery<unknown> | undefined = req.body.query;
    
    statuses.count(query)
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
   * /statuses/deleteAll?auth={auth}:
   *   post:
   *     description: Delete all the statuses (idempotent).
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

    statuses.deleteAll()
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
   * /statuses/get?auth={auth}:
   *   post:
   *     description: Get a status by uuid.
   *     responses:
   *       200:
   *         description: A status.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the label.
   */
  router.post('/get', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuid: string = req.body.uuid;

    statuses.get(uuid)
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
   * /statuses/getAll?auth={auth}:
   *   post:
   *     description: Get all the statuses.
   *     responses:
   *       200:
   *         description: All the statuses.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the statuses.
   */
  router.post('/getAll', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);

    statuses.getAll()
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
   * /statuses/getBulk?auth={auth}:
   *   post:
   *     description: Get a bulk of statuses by uuids.
   *     responses:
   *       200:
   *         description: A bulk of statuses.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the statuses.
   */
  router.post('/getBulk', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuids: string[] = req.body.uuids;

    statuses.getBulk(uuids)
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
   * /labels/getFiltered?auth={auth}:
   *   post:
   *     description: Get all the labels with filtering.
   *     responses:
   *       200:
   *         description: All the labels.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the labels.
   */
   router.post('/getFiltered', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const query: FilterQuery<unknown> = req.body.query;

    statuses.getFiltered(query)
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
   * /statuses/upsert?auth={auth}:
   *   post:
   *     description: Upsert a status by uuid (idempotent).
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
    const value: IStatus = req.body.value;

    statuses.upsert(value)
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
   * /statuses/upsertBulk?auth={auth}:
   *   post:
   *     description: Upsert a bulk of statuses by uuids (idempotent).
   *     responses:
   *       207:
   *         description: Upserted.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to upsert.
   */
  router.post('/upsertBulk', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const values: IStatus[] = req.body.values;

    statuses.upsertBulk(values)
      .then(() => {
        res.sendStatus(207);
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
