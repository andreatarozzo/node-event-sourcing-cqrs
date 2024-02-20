import express from "express";
import { Request, Response } from "express";
import { queryHandler } from "../../query_handlers/query_handler";
import { logger } from "../../utils/logger";

const accountQueryRoute = express.Router();

/**
 * Returns the full history, balance and transactions of an account.
 * @name get/get-account-full-history
 */
accountQueryRoute.get(
  "/get-account-full-history",
  async (req: Request, res: Response, next) => {
    try {
      const accountId = req.query.account_id as string;
      const response = await queryHandler.getAccountFullHistory(accountId);
      return res.status(200).json(response).end();
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

/**
 * Returns the full transactions history of an account.
 * @name get/get-account-transaction-history
 */
accountQueryRoute.get(
  "/get-account-transaction-history",
  async (req: Request, res: Response, next) => {
    try {
      const accountId = req.query.account_id as string;
      const response = await queryHandler.getAccountTransactionsHistory(
        accountId
      );
      return res.status(200).json(response).end();
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

/**
 * Returns all the account entities for which the user id provided is present as owner id.
 * @name get/get-user-accounts-info
 */
accountQueryRoute.get(
  "/get-user-accounts-info",
  async (req: Request, res: Response, next) => {
    try {
      const userId = req.query.user_id as string;
      const response = await queryHandler.getUserAccountsInfo(userId);
      return res.status(200).json(response).end();
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

/**
 * Returns the full history of the creation and changes related to an account.
 * @name get/get-account-entity-history
 */
accountQueryRoute.get(
  "/get-account-entity-history",
  async (req: Request, res: Response, next) => {
    try {
      const accountId = req.query.account_id as string;
      const response = await queryHandler.getAccountEntityHistory(accountId);
      return res.status(200).json(response).end();
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

/**
 * Returns the account balance.
 * @name get/get-account-balance
 */
accountQueryRoute.get(
  "/get-account-balance",
  async (req: Request, res: Response, next) => {
    try {
      const accountId = req.query.account_id as string;
      const response = await queryHandler.getAccountBalance(accountId);
      return res.status(200).json(response).end();
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

export default accountQueryRoute;
