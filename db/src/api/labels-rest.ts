// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * REST Style API for labels.
 * 
 * All the apis are idempotent.
 * 
 * GET /labels/count?auth={auth}
 *  Get the number of labels (with optional filtering).
 * DELETE /labels/items?auth={auth}
 *  Delete all the labels.
 * GET /labels/items/{uuid}?auth={auth}
 *  Get a label by uuid.
 * GET /labels/items?auth={auth}
 *  Get all the labels (with optional filtering).
 * GET /labels/bulk?auth={auth}
 *  Get a bulk of labels by uuids.
 * PUT /labels/items/{uuid}?auth={auth}
 *  Upsert a label by uuid.
 * PUT /labels/bulk?auth={auth}
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
   *   get:
   *     description: Get the number of labels (with optional filtering).
   *     responses:
   *       200:
   *         description: The number.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the number.
   * example: http://localhost:8887/labels/count?auth=UKBumAJziW5eL8t
   */
  router.get('/count', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const query: FilterQuery<unknown> | undefined = req.body.query;

    labels.count(query)
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
   * /labels/items?auth={auth}:
   *   delete:
   *     description: Delete all the labels (idempotent).
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
   * /labels/items/{uuid}?auth={auth}:
   *   get:
   *     description: Get a label by uuid.
   *     responses:
   *       200:
   *         description: A label.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the label.
   * example: http://localhost:8887/labels/items/bdea331b-8bb6-4617-811f-2cddccdbc424?auth=UKBumAJziW5eL8t
   */
  router.get('/items/:uuid', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuid: string = req.params.uuid;

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
   * /labels/items?auth={auth}:
   *   get:
   *     description: Get all the labels (with optional filtering).
   *     responses:
   *       200:
   *         description: All the labels.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the labels.
   * example: http://localhost:8887/labels/items?auth=UKBumAJziW5eL8t
   */
  router.get('/items', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const query: FilterQuery<unknown> | undefined = req.body.query;

    const promise = (query === undefined)
      ? labels.getAll()
      : labels.getFiltered(query);
    promise
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
   * /labels/bulk?auth={auth}:
   *   get:
   *     description: Get a bulk of labels by uuids.
   *     responses:
   *       200:
   *         description: A bulk of labels.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the labels.
   */
  router.get('/bulk', (req, res, next) => {
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
   * /labels/items/{uuid}?auth={auth}:
   *   put:
   *     description: Upsert a label by uuid (idempotent).
   *     responses:
   *       204:
   *         description: Upserted.
   *       400:
   *         description: uuid in parameter and in and label mismatch.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to upsert.
   */
  router.put('/items/:uuid', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuid: string = req.params.uuid;
    const value: ILabel = req.body.value;
    if (uuid !== value.uuid) return res.sendStatus(400);

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
   * /labels/bulk?auth={auth}:
   *   put:
   *     description: Upsert a bulk of labels by uuids (idempotent).
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
