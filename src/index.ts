import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import chalk from 'chalk';

import { Logger, Level } from '@/util/logger';

import version from '@/util/version';
import db from '@/util/database';

import futar from '@/routes/futar';

import type { NextFunction, Request, Response } from 'express';

const app = express();

const logger = new Logger('pizza::main::app', Level.Debug);
const webLogger = new Logger('pizza::main::req');

const PORT = parseInt(process.env.PORT || '3000');

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Powered-By', `Pizza/${version}`);
  next();

  const ip = req.headers['x-forwarded-for'] || req.ip;
  webLogger.info(
    `${ip} "${req.method} ${req.path} HTTP/${req.httpVersion}" ${res.statusCode} ${res.getHeader('Content-Length') ? res.getHeader('Content-Length') : '0'} "${req.get('Referer') ? req.get('Referer') : '-'}" "${req.get('User-Agent')}"`
  );
});

app.use(express.json());
app.use(cors());

(async () => {
  const startTimestamp = Date.now();

  logger.info(chalk.green('★'), 'Adding the `futar` router.')
  app.use('/api/futar', futar);

  // Not found.
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 404,
      message: 'Not Found'
    });
  });

  // Handle unandled errors.
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });

    logger.error(err);
  });

  app.listen(PORT, () => {
    logger.info('⎔ Port:', PORT);
    logger.info('⎔ Startup:', Date.now() - startTimestamp, '(ms)');
  });
})().catch((err) => {
  if (!err['errors']) logger.error(err);
  else
    err['errors'].forEach((e: any) => {
      logger.error(e);
    });
});
