import { Request, Response } from "express";
import { logger } from "../../utils/logger";

export const queryLoggerMiddleware = (
  req: Request,
  res: Response,
  next: any
) => {
  logger.info(`Query: ${JSON.stringify(req.body)}`);
  next();
};
