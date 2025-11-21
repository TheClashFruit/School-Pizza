import express from 'express';
import { z, ZodError } from 'zod';

import {
  createVevo,
  deleteVevo,
  getVevo,
  getVevos,
  updateVevo
} from '@/models/vevo';

import type { Request, Response } from 'express';

const router = express.Router();

const Vevo = z.object({
  vnev: z.string().min(3),
  vcim: z.string().min(3)
});

const VevoOptional = z.object({
  vnev: z.string().min(3).optional(),
  vcim: z.string().min(3).optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const vevok = await getVevos();

    if (!vevok)
      return res.status(404).json({
        error: 404,
        message: 'A vevők nem találhatóak.'
      });

    return res.json(vevok);
  } catch (e: unknown) {
    return res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { vnev, vcim } = await Vevo.parseAsync(req.body);

    const r = await createVevo(vnev, vcim);

    res.status(201).json({
      fazon: r.insertId,
      vnev,
      vcim
    });
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

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const vevo = await getVevo(id as unknown as number);

    if (!vevo)
      return res.status(404).json({
        error: 404,
        message: 'A vevő nem található.'
      });

    return res.json(vevo);
  } catch (e: unknown) {
    return res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { vnev, vcim } = await VevoOptional.parseAsync(req.body);

    await updateVevo(id as unknown as number, vnev, vcim);
    res.status(204).end();
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

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteVevo(id as unknown as number);
    res.status(204).end();
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (e.message.toLowerCase().includes('foreign key constraint'))
        return res.status(409).json({
          error: 409,
          message:
            'Ehez a vevőhőz tartoznak más adatok ezért nem lehet kitörölni.'
        });
    }

    return res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  }
});

export default router;
