// BASE

import { ACCOUNT_TYPE } from "./core";
import {
  AccountCreatedEventData,
  AccountTypeChangedEventData,
  AmountDepositedEventData,
  AmountTransferredEventData,
  UserAddressChangedEventData,
  UserCreatedEventData,
} from "./events";

export type Command = {
  type: USER_COMMAND_TYPE | ACCOUNT_COMMAND_TYPE | TRANSACTION_COMMAND_TYPE;
  timestamp: string;
  data: any;
};

// USER COMMANDS

export interface CreateNewUserCommand extends Command {
  user_name: string;
  data: UserCreatedEventData;
}

export interface ChangeUserAddressCommand extends Command {
  user_id: string;
  user_name: string;
  data: UserAddressChangedEventData;
}

// ACCOUNT COMMANDS

export interface CreateNewAccountCommand extends Command {
  owner_id: string;
  terminal_id: string;
  branch_id: string;
  is_active: boolean;
  account_type: ACCOUNT_TYPE;
  data: AccountCreatedEventData;
}

export interface ChangeAccountTypeCommand extends Command {
  account_type: string;
  account_id: string;
  owner_id: string;
  branch_id: string;
  is_active: boolean;
  data: AccountTypeChangedEventData;
}

// TRANSACTION COMMANDS

export interface TransferAmountCommand extends Command {
  receiver_id: string;
  receiver_account_id: string;
  sender_id: string;
  sender_account_id: string;
  terminal_id: string;
  branch_id: string;
  amount: number;
  data: AmountTransferredEventData | AmountDepositedEventData;
}

export interface DepositAmountCommand extends Command {
  receiver_id: string;
  receiver_account_id: string;
  terminal_id: string;
  branch_id: string;
  amount: number;
  data: AmountDepositedEventData;
}

// TYPES

export enum USER_COMMAND_TYPE {
  CREATE_NEW_USER_COMMAND = "CreateNewUserCommand",
  CHANGE_USER_ADDRESS_COMMAND = "ChangeUserAddressCommand",
}

export enum ACCOUNT_COMMAND_TYPE {
  CREATE_NEW_ACCOUNT_COMMAND = "CreateNewAccountCommand",
  CHANGE_ACCOUNT_TYPE_COMMAND = "ChangeAccountTypeCommand",
}

export enum TRANSACTION_COMMAND_TYPE {
  TRANSFER_AMOUNT_COMMAND = "TransferAmountCommand",
  DEPOSIT_AMOUNT_COMMAND = "DepositAmountCommand",
}
