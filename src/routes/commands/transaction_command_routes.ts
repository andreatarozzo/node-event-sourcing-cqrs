import express from "express";
import { Request, Response } from "express";
import { TransactionCommandCommandHandler } from "../../command_handlers/transaction_command_handler";
import { logger } from "../../utils/logger";

const transferAmountCommandRoute = express.Router();

/**
 * Handle the main logic related to generating a transaction event as result of a Transfer Amount Command.
 * @name post/transfer-amount
 */
transferAmountCommandRoute.post(
  "/transfer-amount",
  async (req: Request, res: Response, next) => {
    try {
      const events = await TransactionCommandCommandHandler.transferAmount(
        req.body
      );
      return res.status(200).json({
        success: true,
        events_saved: events,
      });
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

/**
 * Handle the main logic related to generating a transaction event as result of a Deposit Amount Command.
 * @name post/deposit-amount
 */
transferAmountCommandRoute.post(
  "/deposit-amount",
  async (req: Request, res: Response, next) => {
    try {
      const events = await TransactionCommandCommandHandler.depositAmount(
        req.body
      );
      return res.status(200).json({
        success: true,
        events_saved: events,
      });
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

export default transferAmountCommandRoute;
