import winston from "winston";
import { Request, Response } from "express";

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] : ${message} `;
});

export const loggerSettings = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json(),
    winston.format.timestamp(),
    logFormat
  ),
  meta: false,
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req: Request, res: Response) {
    return false;
  },
};

export const logger = winston.createLogger(loggerSettings);
