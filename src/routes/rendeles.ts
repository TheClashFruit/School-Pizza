import express from 'express';
import { z, ZodError } from 'zod';

import {
  getRendeles,
  getRendelesek,
  newRendeles,
  deleteRendeles
} from '@/models/rendeles';

import type { Request, Response } from 'express';
import { getTetelsForRendeles } from '@/models/tetel';
import { getPizza } from '@/models/pizza';

const router = express.Router();

const Rendeles = z.object({
  vazon: z.number(),
  fazon: z.number()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const orders = await getRendelesek();
    if (!orders)
      return res.status(404).json({
        error: 404,
        message: 'A rendelesék nem találhatóak.'
      });

    const ordersWithTotal = await Promise.all(
      orders.map(async (o) => {
        const items = await getTetelsForRendeles(o.razon);

        let ar = 0;
        await Promise.all(
          items!.map(async (i) => {
            const pizza = await getPizza(i.pazon);

            ar += pizza!.par * i.db;
          })
        );

        return {
          ...o,
          osszeg: ar
        };
      })
    );

    return res.json(ordersWithTotal);
  } catch (e: unknown) {
    return res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { vazon, fazon } = await Rendeles.parseAsync(req.body);

    const r = await newRendeles(vazon, fazon);

    res.status(201).json({
      razon: r.insertId,
      vazon,
      fazon,
      idopont: new Date()
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
    const order = await getRendeles(id as unknown as number);

    if (!order)
      return res.status(404).json({
        error: 404,
        message: 'A rendelés nem található.'
      });

    const items = await getTetelsForRendeles(order.razon);

    let ar = 0;
    if (items) {
      await Promise.all(
        items.map(async (i) => {
          const pizza = await getPizza(i.pazon);
          if (pizza) {
            ar += pizza.par * i.db;
          }
        })
      );
    }

    return res.json({
      ...order,
      osszeg: ar
    });
  } catch (e: unknown) {
    return res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteRendeles(id as unknown as number);
    res.status(204).end();
  } catch (e: unknown) {
    return res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  }
});

export default router;
