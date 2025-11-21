import express from 'express';

import type { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.status(404).json({
    error: 404,
    message: 'Not Found'
  });
});

export default router;