import {
  TransferAmountCommand,
  ITransactionDomainModel,
  TransactionEvent,
  TRANSACTION_EVENT_TYPE,
  AmountTransferredEventData,
  AmountDepositedEventData,
  DepositAmountCommand,
} from "../types";
import { v4 as uuidv4 } from "uuid";

export class TransactionModel implements ITransactionDomainModel {
  constructor() {}

  /**
   * Generates the events related to a command to transfer an amount between accounts
   * @param command
   * @returns
   */
  public transferAmount(command: TransferAmountCommand): TransactionEvent[] {
    return [
      {
        type: TRANSACTION_EVENT_TYPE.AMOUNT_TRANSFERRED_EVENT,
        transaction_id: uuidv4(),
        timestamp: new Date(command.timestamp),
        sender_id: command.sender_id,
        sender_account_id: command.sender_account_id,
        receiver_id: command.receiver_id,
        receiver_account_id: command.receiver_account_id,
        terminal_id: command.terminal_id,
        branch_id: command.branch_id,
        amount: command.amount,
        data: command.data as AmountTransferredEventData,
      } as TransactionEvent,
    ];
  }

  /**
   * Generates the events related to a command to deposit an amount into an account
   * @param command
   * @returns
   */
  public depositAmount(command: DepositAmountCommand): TransactionEvent[] {
    return [
      {
        type: TRANSACTION_EVENT_TYPE.AMOUNT_DEPOSITED_EVENT,
        transaction_id: uuidv4(),
        timestamp: new Date(command.timestamp),
        receiver_id: command.receiver_id,
        receiver_account_id: command.receiver_account_id,
        terminal_id: command.terminal_id,
        branch_id: command.branch_id,
        amount: command.amount,
        data: command.data as AmountDepositedEventData,
      } as TransactionEvent,
    ];
  }
}

export const TransactionDomainModel = new TransactionModel();
