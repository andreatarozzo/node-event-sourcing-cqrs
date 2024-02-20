import express from "express";
import { Request, Response } from "express";
import { AccountCommandHandler } from "../../command_handlers/account_command_handler";
import { TransactionCommandCommandHandler } from "../../command_handlers/transaction_command_handler";
import {
  AccountEvent,
  CreateNewAccountCommand,
  DepositAmountCommand,
  TRANSACTION_COMMAND_TYPE,
} from "../../types";
import { logger } from "../../utils/logger";

const accountCommandRoute = express.Router();

/**
 * Handle the main logic related to a new account creation as result of a Create New Account command.
 * First the account is created and then a deposit transaction is generated with the initial amount specified in the
 * Create New Account command.
 * @name post/create-new-account
 */
accountCommandRoute.post(
  "/create-new-account",
  async (req: Request, res: Response, next) => {
    try {
      const command: CreateNewAccountCommand = req.body;
      const accountEvents = await AccountCommandHandler.createNewAccount(
        command
      );
      const accountCreatedEvent = (accountEvents as AccountEvent[])[0];
      const transactionEvents =
        await TransactionCommandCommandHandler.depositAmount({
          type: TRANSACTION_COMMAND_TYPE.DEPOSIT_AMOUNT_COMMAND,
          timestamp: command.timestamp,
          receiver_id: accountCreatedEvent.owner_id,
          receiver_account_id: accountCreatedEvent.account_id,
          terminal_id: command.terminal_id,
          branch_id: command.branch_id,
          amount: command.data.initial_balance,
          data: {},
        } as DepositAmountCommand);
      return res.status(200).json({
        success: true,
        account_events_saved: accountEvents,
        transaction_events_saved: transactionEvents,
      });
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

/**
 * Handle the main logic related to changing an account type as result of a Change Account Type Command.
 * @name post/change-account-type
 */
accountCommandRoute.post(
  "/change-account-type",
  async (req: Request, res: Response, next) => {
    try {
      const events = await AccountCommandHandler.changeAccountType(req.body);
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

export default accountCommandRoute;
