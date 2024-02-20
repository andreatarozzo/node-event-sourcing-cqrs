import testDatabase from "../test_db_setup";
import { uuidv4RegExp } from "../utils";
import {
  AccountCreatedEventData,
  AccountEvent,
  AccountTypeChangedEventData,
  ACCOUNT_COMMAND_TYPE,
  ACCOUNT_EVENT_TYPE,
  ACCOUNT_TYPE,
  ChangeAccountTypeCommand,
  CreateNewAccountCommand,
} from "../../src/types";
import { AccountCommandHandler } from "../../src/command_handlers/account_command_handler";
import {
  AccountNotFoundError,
  InvalidCommandError,
  NoEventsGeneratedError,
  UserNotFoundError,
} from "../../src/utils/errors";
import { AccountEventModel } from "../../src/database/models/account_event_db_model";
import { UserEventModel } from "../../src/database/models/user_event_db_model";

jest.setTimeout(600000);

// Create new db before each test
beforeAll(async () => {
  await testDatabase.connect();
  await testDatabase.seeder({
    accountEventModel: AccountEventModel,
    userEventModel: UserEventModel,
  });
});

// DB Clean Up
afterAll(async () => {
  await testDatabase.closeDatabase();
});

describe("Account Command Handler", () => {
  const createNewAccountCommand: CreateNewAccountCommand = {
    type: ACCOUNT_COMMAND_TYPE.CREATE_NEW_ACCOUNT_COMMAND,
    owner_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    branch_id: "1",
    terminal_id: "1",
    is_active: true,
    account_type: ACCOUNT_TYPE.PRIVATE,
    timestamp: "2022-02-06T17:52:39.000Z",
    data: {
      initial_balance: 1000,
    },
  };

  const changeAccountTypeCommand: ChangeAccountTypeCommand = {
    account_id: "1",
    owner_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    branch_id: "1",
    is_active: false,
    account_type: ACCOUNT_TYPE.COMMERCIAL,
    type: ACCOUNT_COMMAND_TYPE.CHANGE_ACCOUNT_TYPE_COMMAND,
    timestamp: "2022-02-07T17:52:39.000Z",
    data: {
      previous_account_type: ACCOUNT_TYPE.PRIVATE,
    },
  };

  it("Validator with valid Command", async () => {
    const isValid = AccountCommandHandler.commandValidator(
      createNewAccountCommand,
      ACCOUNT_COMMAND_TYPE.CREATE_NEW_ACCOUNT_COMMAND
    );
    expect(isValid).toBe(true);
  });

  it("Validator with invalid Command: missing values", async () => {
    const isValid = AccountCommandHandler.commandValidator(
      {} as CreateNewAccountCommand,
      ACCOUNT_COMMAND_TYPE.CREATE_NEW_ACCOUNT_COMMAND
    );
    expect(isValid).toBe(false);
  });

  it("Validator with invalid Command: wrong command provided", async () => {
    const isValid = AccountCommandHandler.commandValidator(
      changeAccountTypeCommand,
      ACCOUNT_COMMAND_TYPE.CREATE_NEW_ACCOUNT_COMMAND
    );
    expect(isValid).toBe(false);
  });

  it("Invalid Command Error is thrown: createNewAccount", async () => {
    try {
      await AccountCommandHandler.createNewAccount(
        {} as CreateNewAccountCommand
      );
      fail("No error was thrown");
    } catch (e) {
      return expect(e instanceof InvalidCommandError).toBe(true);
    }
  });

  it("Invalid Command Error is thrown: changeAccountType", async () => {
    try {
      await AccountCommandHandler.changeAccountType(
        {} as ChangeAccountTypeCommand
      );
      fail("No error was thrown");
    } catch (e) {
      return expect(e instanceof InvalidCommandError).toBe(true);
    }
  });

  it("No Events generated Error: createNewAccount", async () => {
    jest
      .spyOn(AccountCommandHandler.accountDomainModel, "createNewAccount")
      .mockImplementationOnce(
        (command: CreateNewAccountCommand) => [] as AccountEvent[]
      );

    try {
      await AccountCommandHandler.createNewAccount(createNewAccountCommand);
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof NoEventsGeneratedError).toBe(true);
    }
  });

  it("No Events generated Error: changeAccountType", async () => {
    jest
      .spyOn(AccountCommandHandler.accountDomainModel, "changeAccountType")
      .mockImplementationOnce(
        (command: ChangeAccountTypeCommand) => [] as AccountEvent[]
      );

    try {
      await AccountCommandHandler.changeAccountType(changeAccountTypeCommand);
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof NoEventsGeneratedError).toBe(true);
    }
  });

  it("No Account found Error: changeAccountType", async () => {
    const changeAccountType: ChangeAccountTypeCommand = JSON.parse(
      JSON.stringify(changeAccountTypeCommand)
    );
    changeAccountType.account_id = "test";

    try {
      await AccountCommandHandler.changeAccountType(changeAccountType);
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof AccountNotFoundError).toBe(true);
    }
  });

  it("No User Found Error when creating a new account: createNewAccount", async () => {
    const createNewAccountComm: CreateNewAccountCommand = JSON.parse(
      JSON.stringify(createNewAccountCommand)
    );
    createNewAccountComm.owner_id = "no_found";

    try {
      await AccountCommandHandler.createNewAccount(createNewAccountComm);
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof UserNotFoundError).toBe(true);
    }
  });

  it("Create New Account Command Handling: createNewAccount", async () => {
    const eventsSaved = await AccountCommandHandler.createNewAccount(
      createNewAccountCommand
    );
    expect(eventsSaved as AccountEvent[]).toHaveLength(1);

    const accountCreatedEvent: AccountEvent = (
      eventsSaved as AccountEvent[]
    )[0];

    expect(accountCreatedEvent.type).toBe(
      ACCOUNT_EVENT_TYPE.ACCOUNT_CREATED_EVENT
    );
    expect(accountCreatedEvent.account_id).toMatch(uuidv4RegExp);
    expect(accountCreatedEvent.owner_id).toBe(createNewAccountCommand.owner_id);
    expect(accountCreatedEvent.branch_id).toBe(
      createNewAccountCommand.branch_id
    );
    expect(accountCreatedEvent.account_type).toBe(
      createNewAccountCommand.account_type
    );
    expect(accountCreatedEvent.timestamp.toISOString()).toBe(
      createNewAccountCommand.timestamp
    );
    expect(accountCreatedEvent.data).toMatchObject(
      createNewAccountCommand.data as AccountCreatedEventData
    );

    changeAccountTypeCommand.account_id = accountCreatedEvent.account_id;
  });

  it("Change Account Type Command Handling: changeAccountType", async () => {
    const eventsSaved = await AccountCommandHandler.changeAccountType(
      changeAccountTypeCommand
    );
    expect(eventsSaved as AccountEvent[]).toHaveLength(1);

    const accountTypeChangedEvent: AccountEvent = (
      eventsSaved as AccountEvent[]
    )[0];

    expect(accountTypeChangedEvent.type).toBe(
      ACCOUNT_EVENT_TYPE.ACCOUNT_TYPE_CHANGED_EVENT
    );
    expect(accountTypeChangedEvent.account_id).toMatch(
      changeAccountTypeCommand.account_id
    );
    expect(accountTypeChangedEvent.owner_id).toBe(
      changeAccountTypeCommand.owner_id
    );
    expect(accountTypeChangedEvent.branch_id).toBe(
      changeAccountTypeCommand.branch_id
    );
    expect(accountTypeChangedEvent.account_type).toBe(
      changeAccountTypeCommand.account_type
    );
    expect(accountTypeChangedEvent.timestamp.toISOString()).toBe(
      changeAccountTypeCommand.timestamp
    );
    expect(accountTypeChangedEvent.data).toMatchObject(
      changeAccountTypeCommand.data as AccountTypeChangedEventData
    );
  });
});
