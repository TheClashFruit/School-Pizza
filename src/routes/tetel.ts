import express from 'express';
import { z, ZodError } from 'zod';

import {
  getRendeles,
  getRendelesek,
  newRendeles,
  deleteRendeles
} from '@/models/rendeles';
import { createTetel, deleteTetel, getTetelsForRendeles } from '@/models/tetel';
import { getPizza } from '@/models/pizza';

import type { Request, Response } from 'express';
import { Tetel } from '@/util/types';

const router = express.Router();

const Tetel = z.object({
  razon: z.number(),
  pazon: z.number(),
  db: z.number().min(1).max(20)
});

const TetelCount = z.object({
  db: z.number().min(1).max(20)
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const tetelek = await getTetelsForRendeles(id as unknown as number);

    if (!tetelek || tetelek.length <= 0)
      return res.status(404).json({
        error: 404,
        message: 'Nincs ilyen rendelés.'
      });

    return res.json(tetelek);
  } catch (e: unknown) {
    return res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  }
});
router.post('/', async (req: Request, res: Response) => {
  try {
    const { pazon, razon, db } = await Tetel.parseAsync(req.body);

    const pizza = await getPizza(pazon);
    if (!pizza) {
      return res.status(404).json({
        error: 404,
        message: 'A megadott pizza nem létezik.'
      });
    }

    const rendeles = await getRendeles(razon);
    if (!rendeles) {
      return res.status(404).json({
        error: 404,
        message: 'A megadott rendelés nem létezik.'
      });
    }

    await createTetel(razon, pazon, db);
    return res.status(204).json();
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      const details: Record<string, string> = {};
      e.issues.forEach((issue) => {
        const field = issue.path.join('.');
        details[field] = issue.message;
      });

      return res.status(400).json({
        error: 400,
        message: 'Validation Error',
        details
      });
    }

    throw e;
  }
});

const Params = z.object({
  oid: z.number(),
  pid: z.number()
});

router.put('/:oid/:pid', async (req: Request, res: Response) => {
  try {
    const { oid, pid } = await Params.parseAsync(req.params);
    const { db } = await TetelCount.parseAsync(req.body);

    const rendeles = await getRendeles(oid);
    if (!rendeles) {
      return res.status(404).json({
        error: 404,
        message: 'A megadott rendelés nem létezik.'
      });
    }

    const pizza = await getPizza(pid);
    if (!pizza) {
      return res.status(404).json({
        error: 404,
        message: 'A megadott pizza nem létezik.'
      });
    }

    const tetelek = await getTetelsForRendeles(oid);
    const tetel = tetelek!.find((t: Tetel) => t.pazon === pid);

    if (!tetel) {
      return res.status(404).json({
        error: 404,
        message: 'A megadott tétel nem létezik.'
      });
    }

    await createTetel(oid, pid, db);
    return res.status(204).json();
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      const details: Record<string, string> = {};
      e.issues.forEach((issue) => {
        const field = issue.path.join('.');
        details[field] = issue.message;
      });

      return res.status(400).json({
        error: 400,
        message: 'Validation Error',
        details
      });
    }

    throw e;
  }
});

router.delete('/:oid/:pid', async (req: Request, res: Response) => {
  try {
    const { oid, pid } = await Params.parseAsync(req.params);

    const rendeles = await getRendeles(oid);
    if (!rendeles) {
      return res.status(404).json({
        error: 404,
        message: 'A megadott rendelés nem létezik.'
      });
    }

    const tetelek = await getTetelsForRendeles(oid);
    const tetel = tetelek!.find((t: Tetel) => t.pazon === pid);

    if (!tetel) {
      return res.status(404).json({
        error: 404,
        message: 'A megadott tétel nem létezik.'
      });
    }

    await deleteTetel(oid, pid);

    return res.status(204).json();
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      const details: Record<string, string> = {};
      e.issues.forEach((issue) => {
        const field = issue.path.join('.');
        details[field] = issue.message;
      });

      return res.status(400).json({
        error: 400,
        message: 'Validation Error',
        details
      });
    }

    throw e;
  }
});

export default router;
