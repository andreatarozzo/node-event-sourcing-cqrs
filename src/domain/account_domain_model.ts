import {
  IAccountDomainModel,
  ACCOUNT_EVENT_TYPE,
  CreateNewAccountCommand,
  AccountEvent,
  AccountCreatedEventData,
  ChangeAccountTypeCommand,
  AccountTypeChangedEventData,
} from "../types";
import { v4 as uuidv4 } from "uuid";

export class AccountModel implements IAccountDomainModel {
  constructor() {}

  /**
   * Generates the events related to a command to create a new account
   * @param command
   * @returns
   */
  public createNewAccount(command: CreateNewAccountCommand): AccountEvent[] {
    return [
      {
        type: ACCOUNT_EVENT_TYPE.ACCOUNT_CREATED_EVENT,
        owner_id: command.owner_id,
        account_id: uuidv4(),
        branch_id: command.branch_id,
        timestamp: new Date(command.timestamp),
        is_active: command.is_active,
        account_type: command.account_type,
        data: command.data as AccountCreatedEventData,
      } as AccountEvent,
    ];
  }

  /**
   * Generates the events related to a command to change an account type
   * @param command
   * @returns
   */
  public changeAccountType(command: ChangeAccountTypeCommand): AccountEvent[] {
    return [
      {
        type: ACCOUNT_EVENT_TYPE.ACCOUNT_TYPE_CHANGED_EVENT,
        owner_id: command.owner_id,
        account_id: command.account_id,
        branch_id: command.branch_id,
        timestamp: new Date(command.timestamp),
        is_active: command.is_active,
        account_type: command.account_type,
        data: command.data as AccountTypeChangedEventData,
      } as AccountEvent,
    ];
  }
}

export const AccountDomainModel = new AccountModel();
