import testDatabase from "../test_db_setup";
import { uuidv4RegExp } from "../utils";
import {
  AmountDepositedEventData,
  AmountTransferredEventData,
  TransactionEvent,
  TRANSACTION_COMMAND_TYPE,
  TRANSACTION_EVENT_TYPE,
  TransferAmountCommand,
  DepositAmountCommand,
} from "../../src/types";
import { TransactionCommandCommandHandler } from "../../src/command_handlers/transaction_command_handler";
import {
  AccountNotFoundError,
  InvalidCommandError,
  NoEventsGeneratedError,
  UserNotFoundError,
} from "../../src/utils/errors";
import { TransactionEventModel } from "../../src/database/models/transaction_event_db_model";
import { UserEventModel } from "../../src/database/models/user_event_db_model";
import { AccountEventModel } from "../../src/database/models/account_event_db_model";

jest.setTimeout(600000);

// Create new db before each test
beforeAll(async () => {
  await testDatabase.connect();
  await testDatabase.seeder({
    transactionEventModel: TransactionEventModel,
    userEventModel: UserEventModel,
    accountEventModel: AccountEventModel,
  });
});

// DB Clean Up
afterAll(async () => {
  await testDatabase.closeDatabase();
});

describe("Transaction Command Handler", () => {
  const TransferAmountCommand: TransferAmountCommand = {
    type: TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND,
    timestamp: "2022-02-06T17:52:39.000Z",
    receiver_id: "1",
    receiver_account_id: "1",
    sender_id: "2",
    sender_account_id: "2",
    terminal_id: "1",
    branch_id: "1",
    amount: 10.12,
    data: {},
  };

  const depositAmountCommand: DepositAmountCommand = {
    type: TRANSACTION_COMMAND_TYPE.DEPOSIT_AMOUNT_COMMAND,
    timestamp: "2022-02-06T17:52:39.000Z",
    receiver_id: "1",
    receiver_account_id: "1",
    terminal_id: "1",
    branch_id: "1",
    amount: 10.12,
    data: {},
  };

  it("Validator with valid Command", async () => {
    const isValid = TransactionCommandCommandHandler.commandValidator(
      TransferAmountCommand,
      TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND
    );
    expect(isValid).toBe(true);
  });

  it("Validator with invalid Command: missing values", async () => {
    const isValid = TransactionCommandCommandHandler.commandValidator(
      {} as TransferAmountCommand,
      TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND
    );
    expect(isValid).toBe(false);
  });

  it("Invalid Command Error is thrown: transferAmount", async () => {
    try {
      await TransactionCommandCommandHandler.transferAmount(
        {} as TransferAmountCommand
      );
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof InvalidCommandError).toBe(true);
    }
  });

  it("No Events generated Error: transferAmount", async () => {
    jest
      .spyOn(TransactionCommandCommandHandler, "checkAccountBalance")
      .mockResolvedValueOnce(10000);

    jest
      .spyOn(
        TransactionCommandCommandHandler.transactionDomainModel,
        "transferAmount"
      )
      .mockReturnValueOnce([] as TransactionEvent[]);

    try {
      await TransactionCommandCommandHandler.transferAmount(
        TransferAmountCommand
      );
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof NoEventsGeneratedError).toBe(true);
    }
  });

  it("User Not Found Error when the receiver_id or sender_id are not related to existing users: checkUsersAndAccounts", async () => {
    try {
      await TransactionCommandCommandHandler.checkUsersAndAccounts({
        commandType: TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND,
        receiver_id: "not_found",
        sender_id: "1",
        receiver_account_id: "1",
        sender_account_id: "1",
      });
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof UserNotFoundError).toBe(true);
    }

    try {
      await TransactionCommandCommandHandler.checkUsersAndAccounts({
        commandType: TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND,
        receiver_id: "1",
        sender_id: "not_found",
        receiver_account_id: "1",
        sender_account_id: "1",
      });
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof UserNotFoundError).toBe(true);
    }
  });

  it("Account Not Found Error when the receiver_account_id or sender_account_id are not related to existing accounts: checkUsersAndAccounts", async () => {
    try {
      await TransactionCommandCommandHandler.checkUsersAndAccounts({
        commandType: TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND,
        receiver_id: "1",
        sender_id: "1",
        receiver_account_id: "not_found",
        sender_account_id: "1",
      });
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof AccountNotFoundError).toBe(true);
    }

    try {
      await TransactionCommandCommandHandler.checkUsersAndAccounts({
        commandType: TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND,
        receiver_id: "1",
        sender_id: "1",
        receiver_account_id: "1",
        sender_account_id: "not_found",
      });
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof AccountNotFoundError).toBe(true);
    }
  });

  it("Transfer Amount Command Handling: transferAmount", async () => {
    const eventsSaved = await TransactionCommandCommandHandler.transferAmount(
      TransferAmountCommand
    );
    expect(eventsSaved as TransactionEvent[]).toHaveLength(1);

    const amountTransferredEvent: TransactionEvent = (
      eventsSaved as TransactionEvent[]
    )[0];

    expect(amountTransferredEvent.type).toBe(
      TRANSACTION_EVENT_TYPE.AMOUNT_TRANSFERRED_EVENT
    );
    expect(amountTransferredEvent.transaction_id).toMatch(uuidv4RegExp);
    expect(amountTransferredEvent.amount).toBe(TransferAmountCommand.amount);
    expect(amountTransferredEvent.branch_id).toBe(
      TransferAmountCommand.branch_id
    );
    expect(amountTransferredEvent.terminal_id).toBe(
      TransferAmountCommand.terminal_id
    );
    expect(amountTransferredEvent.receiver_id).toBe(
      TransferAmountCommand.receiver_id
    );
    expect(amountTransferredEvent.receiver_account_id).toBe(
      TransferAmountCommand.receiver_account_id
    );
    expect(amountTransferredEvent.sender_id).toBe(
      TransferAmountCommand.sender_id
    );
    expect(amountTransferredEvent.sender_account_id).toBe(
      TransferAmountCommand.sender_account_id
    );
    expect(amountTransferredEvent.timestamp.toISOString()).toBe(
      TransferAmountCommand.timestamp
    );
    expect(amountTransferredEvent.data).toBe(
      TransferAmountCommand.data as AmountTransferredEventData
    );
  });

  it("Deposit Amount Command Handling: depositAmount", async () => {
    const eventsSaved = await TransactionCommandCommandHandler.depositAmount(
      depositAmountCommand
    );
    expect(eventsSaved as TransactionEvent[]).toHaveLength(1);

    const amountDepositedEvent: TransactionEvent = (
      eventsSaved as TransactionEvent[]
    )[0];

    expect(amountDepositedEvent.type).toBe(
      TRANSACTION_EVENT_TYPE.AMOUNT_DEPOSITED_EVENT
    );
    expect(amountDepositedEvent.transaction_id).toMatch(uuidv4RegExp);
    expect(amountDepositedEvent.amount).toBe(depositAmountCommand.amount);
    expect(amountDepositedEvent.branch_id).toBe(depositAmountCommand.branch_id);
    expect(amountDepositedEvent.terminal_id).toBe(
      depositAmountCommand.terminal_id
    );
    expect(amountDepositedEvent.receiver_id).toBe(
      depositAmountCommand.receiver_id
    );
    expect(amountDepositedEvent.receiver_account_id).toBe(
      depositAmountCommand.receiver_account_id
    );
    expect(amountDepositedEvent.timestamp.toISOString()).toBe(
      depositAmountCommand.timestamp
    );
    expect(amountDepositedEvent.data).toBe(
      depositAmountCommand.data as AmountDepositedEventData
    );
  });
});
