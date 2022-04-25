// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * RPC Style API for labels.
 * 
 * All the apis are idempotent.
 * 
 * POST /labels/count?auth={auth}
 *  Get the number of labels.
 * POST /labels/countByValue?auth={auth}
 *  Get the number of labels with filtering by value.
 * POST /labels/deleteAll?auth={auth}
 *  Delete all the labels.
 * POST /labels/get?auth={auth}
 *  Get a label by uuid.
 * POST /labels/getAll?auth={auth}
 *  Get all the labels.
 * POST /labels/getBulk?auth={auth}
 *  Get a bulk of labels by uuids.
 * POST /labels/getFiltered?auth={auth}
 *  Get all the labels with filtering.
 * POST /labels/upsert?auth={auth}
 *  Upsert a label by uuid.
 * POST /labels/upsertBulk?auth={auth}
 *  Upsert a bulk of labels by uuids.
 */

import { Router } from 'express';
import { FilterQuery } from 'mongoose';
import { ILabel, ILabelStorage } from '../commons/types';

const factory = (
  labels: ILabelStorage,
  secrete: string,
): Router => {
  const router = Router();

  /**
   * /labels/count?auth={auth}:
   *   post:
   *     description: Get the number of labels.
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

    labels.count()
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
   * /labels/countByValue?auth={auth}:
   *   post:
   *     description: Get the number of labels with filtering by value.
   *     responses:
   *       200:
   *         description: The number.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the number.
   */
   router.post('/countByValue', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const value: unknown = req.body.value;

    labels.count({ value: { $eq: value } })
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
   * /labels/deleteAll?auth={auth}:
   *   post:
   *     description: Delete all the labels (idempotent).
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

    labels.deleteAll()
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
   * /labels/get?auth={auth}:
   *   post:
   *     description: Get a label by uuid.
   *     responses:
   *       200:
   *         description: A label.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the label.
   */
  router.post('/get', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuid: string = req.body.uuid;

    labels.get(uuid)
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
   * /labels/getAll?auth={auth}:
   *   post:
   *     description: Get all the labels.
   *     responses:
   *       200:
   *         description: All the labels.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the labels.
   */
  router.post('/getAll', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);

    labels.getAll()
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
   * /labels/getBulk?auth={auth}:
   *   post:
   *     description: Get a bulk of labels by uuids.
   *     responses:
   *       200:
   *         description: A bulk of labels.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the labels.
   */
  router.post('/getBulk', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuids: string[] = req.body.uuids;

    labels.getBulk(uuids)
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

    labels.getFiltered(query)
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
   * /labels/upsert?auth={auth}:
   *   post:
   *     description: Upsert a label by uuid (idempotent).
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
    const value: ILabel = req.body.value;

    labels.upsert(value)
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
   * /labels/upsertBulk?auth={auth}:
   *   post:
   *     description: Upsert a bulk of labels by uuids (idempotent).
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
    const values: ILabel[] = req.body.values;

    labels.upsertBulk(values)
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
