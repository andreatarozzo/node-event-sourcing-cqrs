import { AccountDomainModel } from "../../../src/domain/account_domain_model";
import {
  AccountEvent,
  AccountTypeChangedEventData,
  ACCOUNT_COMMAND_TYPE,
  ACCOUNT_EVENT_TYPE,
  ACCOUNT_TYPE,
  ChangeAccountTypeCommand,
  CreateNewAccountCommand,
} from "../../../src/types";
import { uuidv4RegExp } from "../../utils";

jest.setTimeout(600000);

describe("Account Domain Model", () => {
  const createNewAccountCommand: CreateNewAccountCommand = {
    type: ACCOUNT_COMMAND_TYPE.CREATE_NEW_ACCOUNT_COMMAND,
    owner_id: "12",
    branch_id: "1",
    is_active: true,
    account_type: ACCOUNT_TYPE.PRIVATE,
    timestamp: "2022-02-06T17:52:39.000Z",
    data: {
      initial_balance: 1000,
    },
    terminal_id: "1",
  };

  const changeAccountTypeCommand: ChangeAccountTypeCommand = {
    account_id: "",
    owner_id: "12",
    branch_id: "1",
    is_active: false,
    account_type: ACCOUNT_TYPE.COMMERCIAL,
    type: ACCOUNT_COMMAND_TYPE.CHANGE_ACCOUNT_TYPE_COMMAND,
    timestamp: "2022-02-07T17:52:39.000Z",
    data: {
      previous_account_type: ACCOUNT_TYPE.PRIVATE,
    },
  };

  it("It generates the ACCOUNT_CREATED_EVENTs: createNewAccountCommand", async () => {
    const events = AccountDomainModel.createNewAccount(createNewAccountCommand);
    expect(events.length).toBe(1);

    const event: AccountEvent = events[0];

    expect(event.type).toBe(ACCOUNT_EVENT_TYPE.ACCOUNT_CREATED_EVENT);
    expect(event.account_id).toMatch(uuidv4RegExp);
    expect(event.owner_id).toBe(createNewAccountCommand.owner_id);
    expect(event.is_active).toBe(createNewAccountCommand.is_active);
    expect(event.branch_id).toBe(createNewAccountCommand.branch_id);
    expect(event.account_type).toBe(createNewAccountCommand.account_type);
    expect(event.timestamp.toISOString()).toBe(
      createNewAccountCommand.timestamp
    );
    changeAccountTypeCommand.account_id = event.account_id;
  });

  it("It generates the ACCOUNT_TYPE_CHANGED_EVENTs: changeAccountTypeCommand", async () => {
    const events = AccountDomainModel.changeAccountType(
      changeAccountTypeCommand
    );
    expect(events.length).toBe(1);

    const event: AccountEvent = events[0];

    expect(event.type).toBe(ACCOUNT_EVENT_TYPE.ACCOUNT_TYPE_CHANGED_EVENT);
    expect(event.account_id).toMatch(uuidv4RegExp);
    expect(event.owner_id).toBe(changeAccountTypeCommand.owner_id);
    expect(event.is_active).toBe(changeAccountTypeCommand.is_active);
    expect(event.branch_id).toBe(changeAccountTypeCommand.branch_id);
    expect(event.account_type).toBe(changeAccountTypeCommand.account_type);
    expect(event.timestamp.toISOString()).toBe(
      changeAccountTypeCommand.timestamp
    );
    expect(event.data).toMatchObject(
      changeAccountTypeCommand.data as AccountTypeChangedEventData
    );
  });
});
