import express from 'express';
import { z, ZodError } from 'zod';

import { createFutar, deleteFutar, getFutar, getFutars, updateFutar } from '@/util/database';

import type { Request, Response } from 'express';

const router = express.Router();

const Futar = z.object({
  fnev: z.string().min(3),
  ftel: z.e164()
});

const FutarOptional = z.object({
  fnev: z.string().min(3).optional(),
  ftel: z.e164().optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const futar = await getFutars();

    if (!futar)
      return res.status(404).json({
        error: 404,
        message: 'A futárok nem találhatóak.'
      });
    
    return res.json(futar);
  } catch (e: unknown) {
    return res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { fnev, ftel } = await Futar.parseAsync(req.body);

    const r = await createFutar(fnev, ftel);

    res.status(201).json({
      fazon: r.insertId,
      fnev,
      ftel
    });
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      const details: Record<string, string> = {};
      e.issues.forEach(issue => {
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
    const futar = await getFutar(id as unknown as number);

    if (!futar)
      return res.status(404).json({
        error: 404,
        message: 'A futár nem található.'
      });
    
    return res.json(futar);
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
    const { fnev, ftel } = await FutarOptional.parseAsync(req.body);

    await updateFutar(id as unknown as number, fnev, ftel);
    res.status(204).end();
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      const details: Record<string, string> = {};
      e.issues.forEach(issue => {
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
    await deleteFutar(id as unknown as number);
    res.status(204).end();
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (e.message.toLowerCase().includes('foreign key constraint'))
        return res.status(409).json({
          error: 409,
          message: 'Ehez a futárhoz tartoznak más adatok ezért nem lehet kitörölni.'
        });
    }

    return res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  }
});

export default router;