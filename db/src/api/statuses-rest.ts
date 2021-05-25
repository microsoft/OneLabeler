/**
 * REST Style API for statuses.
 * 
 * All the apis are idempotent.
 * 
 * GET /statuses/count?auth={auth}
 *  Get the number of statuses (with optional filtering).
 * DELETE /statuses/items?auth={auth}
 *  Delete all the statuses.
 * GET /statuses/items/{uuid}?auth={auth}
 *  Get a label by uuid.
 * GET /statuses/items?auth={auth}
 *  Get all the statuses.
 * GET /statuses/bulk?auth={auth}
 *  Get a bulk of statuses by uuids.
 * PUT /statuses/items/{uuid}?auth={auth}
 *  Upsert a label by uuid.
 * PUT /statuses/bulk?auth={auth}
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
   *   get:
   *     description: Get the number of statuses (with optional filtering).
   *     responses:
   *       200:
   *         description: The number.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the number.
   *  example: http://localhost:8887/statuses/count?auth=UKBumAJziW5eL8t
   */
  router.get('/count', (req, res, next) => {
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
   * /statuses/items?auth={auth}:
   *   delete:
   *     description: Delete all the statuses (idempotent).
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
   * /statuses/items/{uuid}?auth={auth}:
   *   get:
   *     description: Get a status by uuid.
   *     responses:
   *       200:
   *         description: A status.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the label.
   * example: http://localhost:8887/statuses/items/bdea331b-8bb6-4617-811f-2cddccdbc424?auth=UKBumAJziW5eL8t
   */
  router.get('/items/:uuid', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuid: string = req.params.uuid;

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
   * /statuses/items?auth={auth}:
   *   get:
   *     description: Get all the statuses.
   *     responses:
   *       200:
   *         description: All the statuses.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the statuses.
   * example: http://localhost:8887/statuses/items?auth=UKBumAJziW5eL8t
   */
  router.get('/items', (req, res, next) => {
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
   * /statuses/bulk?auth={auth}:
   *   get:
   *     description: Get a bulk of statuses by uuids.
   *     responses:
   *       200:
   *         description: A bulk of statuses.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to get the statuses.
   */
  router.get('/bulk', (req, res, next) => {
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
   * /statuses/items/{uuid}?auth={auth}:
   *   put:
   *     description: Upsert a status by uuid (idempotent).
   *     responses:
   *       204:
   *         description: Upserted.
   *       400:
   *         description: uuid in parameter and in and status mismatch.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to upsert.
   */
  router.put('/items/:uuid', (req, res, next) => {
    const auth: string = req.query.auth as string;
    if (auth !== secrete) return res.sendStatus(401);
    const uuid: string = req.params.uuid;
    const value: IStatus = req.body.value;
    if (uuid !== value.uuid) return res.sendStatus(400);

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
   * /statuses/bulk?auth={auth}:
   *   put:
   *     description: Upsert a bulk of statuses by uuids (idempotent).
   *     responses:
   *       207:
   *         description: Upserted.
   *       401:
   *         description: Unauthorized.
   *       500:
   *         description: Unable to upsert.
   */
  router.put('/bulk', (req, res, next) => {
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
