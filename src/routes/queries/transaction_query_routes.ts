import express from "express";
import { Request, Response } from "express";
import { queryHandler } from "../../query_handlers/query_handler";
import { logger } from "../../utils/logger";

const transactionQueryRoute = express.Router();

/**
 * Returns a transaction event that matches the transaction id provided
 * @name get/get-transaction-by-transaction-id
 */
transactionQueryRoute.get(
  "/get-transaction-by-transaction-id",
  async (req: Request, res: Response, next) => {
    try {
      const transactionId = req.query.transaction_id as string;
      const response = await queryHandler.getTransactionByTransactionId(
        transactionId
      );
      return res.status(200).json(response).end();
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

export default transactionQueryRoute;
