import { Request, Response } from "express";
import { logger } from "../../utils/logger";

export const commandLoggerMiddleware = (
  req: Request,
  res: Response,
  next: any
) => {
  logger.info(`${req.body.type}: ${JSON.stringify(req.body)}`);
  next();
};
