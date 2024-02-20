import { TransactionDomainModel } from "../../../src/domain/transaction_domain_model";
import {
  TRANSACTION_EVENT_TYPE,
  TransactionEvent,
  TRANSACTION_COMMAND_TYPE,
  TransferAmountCommand,
  DepositAmountCommand,
} from "../../../src/types";
import { uuidv4RegExp } from "../../utils";

jest.setTimeout(600000);

describe("Transaction Domain Model", () => {
  const TransferAmountCommand: TransferAmountCommand = {
    receiver_id: "1",
    receiver_account_id: "1",
    sender_id: "2",
    sender_account_id: "2",
    terminal_id: "1",
    branch_id: "1",
    amount: 10.12,
    data: {},
    type: TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND,
    timestamp: "2022-02-06T17:52:39.000Z",
  };

  const depositAmountCommand: DepositAmountCommand = {
    receiver_id: "1",
    receiver_account_id: "1",
    terminal_id: "1",
    branch_id: "1",
    amount: 10.12,
    data: {},
    type: TRANSACTION_COMMAND_TYPE.DEPOSIT_AMOUNT_COMMAND,
    timestamp: "2022-02-06T17:52:39.000Z",
  };

  it("It generates the AMOUNT_TRANSFERRED_EVENTs: transferAmount", async () => {
    const events = TransactionDomainModel.transferAmount(TransferAmountCommand);
    expect(events.length).toBe(1);

    const event: TransactionEvent = events[0];

    expect(event.type).toBe(TRANSACTION_EVENT_TYPE.AMOUNT_TRANSFERRED_EVENT);
    expect(event.transaction_id).toMatch(uuidv4RegExp);
    expect(event.amount).toBe(TransferAmountCommand.amount);
    expect(event.branch_id).toBe(TransferAmountCommand.branch_id);
    expect(event.receiver_account_id).toBe(
      TransferAmountCommand.receiver_account_id
    );
    expect(event.receiver_id).toBe(TransferAmountCommand.receiver_id);
    expect(event.sender_account_id).toBe(
      TransferAmountCommand.sender_account_id
    );
    expect(event.sender_id).toBe(TransferAmountCommand.sender_id);
    expect(event.terminal_id).toBe(TransferAmountCommand.terminal_id);
    expect(event.timestamp.toISOString()).toBe(TransferAmountCommand.timestamp);
  });

  it("It generates the AMOUNT_DEPOSITED_EVENTs: depositAmount", async () => {
    const events = TransactionDomainModel.depositAmount(depositAmountCommand);
    expect(events.length).toBe(1);

    const event: TransactionEvent = events[0];

    expect(event.type).toBe(TRANSACTION_EVENT_TYPE.AMOUNT_DEPOSITED_EVENT);
    expect(event.transaction_id).toMatch(uuidv4RegExp);
    expect(event.amount).toBe(TransferAmountCommand.amount);
    expect(event.branch_id).toBe(TransferAmountCommand.branch_id);
    expect(event.receiver_account_id).toBe(
      TransferAmountCommand.receiver_account_id
    );
    expect(event.receiver_id).toBe(TransferAmountCommand.receiver_id);
    expect(event.terminal_id).toBe(TransferAmountCommand.terminal_id);
    expect(event.timestamp.toISOString()).toBe(TransferAmountCommand.timestamp);
  });
});
