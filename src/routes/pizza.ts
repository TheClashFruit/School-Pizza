import express from 'express';
import { z, ZodError } from 'zod';

import { createPizza, deletePizza, getPizza, getPizzas, updatePizza } from '@/util/database';

import type { Request, Response } from 'express';

const router = express.Router();

const Pizza = z.object({
  pnev: z.string().min(3),
  par: z.number().min(100)
});

const PizzaOptional = z.object({
  pnev: z.string().min(3).optional(),
  par: z.number().min(100).optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const pizzas = await getPizzas();

    if (!pizzas)
      return res.status(404).json({
        error: 404,
        message: 'A pizzák nem találhatóak.'
      });
    
    return res.json(pizzas);
  } catch (e: unknown) {
    return res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { pnev, par } = await Pizza.parseAsync(req.body);

    const r = await createPizza(pnev, par);

    res.status(201).json({
      fazon: r.insertId,
      pnev, par
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
    const pizza = await getPizza(id as unknown as number);

    if (!pizza)
      return res.status(404).json({
        error: 404,
        message: 'A pizza nem található.'
      });
    
    return res.json(pizza);
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
    const { pnev, par } = await PizzaOptional.parseAsync(req.body);

    await updatePizza(id as unknown as number, pnev, par);
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
    await deletePizza(id as unknown as number);
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