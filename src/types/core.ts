import { Model } from "mongoose";
import {
  CreateNewAccountCommand,
  ChangeAccountTypeCommand,
  CreateNewUserCommand,
  TransferAmountCommand,
  Command,
  ChangeUserAddressCommand,
  USER_COMMAND_TYPE,
  ACCOUNT_COMMAND_TYPE,
  TRANSACTION_COMMAND_TYPE,
  AccountEvent,
  Event,
  TransactionEvent,
  UserEvent,
  AccountBalanceQueryResult,
  AccountEntityHistoryQueryResult,
  AccountFullHistoryQueryResult,
  UserAccountsInfoQueryResult,
  UserHistoryQueryResult,
  UserTransactionsQueryResult,
  AccountTransactionsHistoryQueryResult,
  DepositAmountCommand,
} from "./index";

// ENTITIES

export type User = {
  id: string;
  name: string;
  address: string;
};

export type Account = {
  id: string;
  owner_id: string;
  account_type: ACCOUNT_TYPE;
  branch_id: string;
  is_active: boolean;
};

export enum ACCOUNT_TYPE {
  PRIVATE = "private",
  COMMERCIAL = "commercial",
}

export type AuthorizedUser = {
  username: string;
  password: string;
};

// REPOSITORIES

export interface IUserRepository {
  userEventModel: Model<UserEvent, {}, {}, {}>;
  userReducer: UserReducerFunction;
  getEventsByUserId: (user_id: string) => Promise<UserEvent[] | void>;
  getUserById: (user_id: string) => Promise<User | void>;
  getUsersEvents: () => Promise<UserEvent[] | void>;
  saveUserEvents: (user_events: UserEvent[]) => Promise<UserEvent[] | void>;
}

export interface IAccountRepository {
  accountEventModel: Model<AccountEvent, {}, {}, {}>;
  accountReducer: AccountReducerFunction;
  getEventsByAccountId: (account_id: string) => Promise<AccountEvent[] | void>;
  getEventsByOwnerId: (owner_id: string) => Promise<AccountEvent[] | void>;
  getAccountById: (account_id: string) => Promise<Account | void>;
  getAccountsByOwnerId: (account_id: string) => Promise<Account[] | void>;
  saveAccountEvents: (
    account_events: AccountEvent[]
  ) => Promise<AccountEvent[] | void>;
}

export interface ITransactionRepository {
  transactionEventModel: Model<TransactionEvent, {}, {}, {}>;
  balanceReducer: BalanceReducerFunction;
  getEventsBySenderId: (
    sender_id: string
  ) => Promise<TransactionEvent[] | void>;
  getEventsByReceiverId: (
    receiver_id: string
  ) => Promise<TransactionEvent[] | void>;
  getEventsByAccountId: (
    account_id: string
  ) => Promise<TransactionEvent[] | void>;
  getEventsBySenderAccountId: (
    sender_account_id: string
  ) => Promise<TransactionEvent[] | void>;
  getEventsByReceiverAccountId: (
    receiver_account_id: string
  ) => Promise<TransactionEvent[] | void>;
  getTransactionByTransactionId: (
    transaction_id: string
  ) => Promise<TransactionEvent | void | null>;
  getEventsByUserId: (user_id: string) => Promise<TransactionEvent[] | void>;
  saveTransactionEvents: (
    transaction_events: TransactionEvent[]
  ) => Promise<TransactionEvent[] | void>;
}

// COMMAND HANDLERS

export interface IUserCommandHandler {
  commandValidator: (
    command: Command,
    expectedCommandType: USER_COMMAND_TYPE
  ) => boolean;
  createNewUser: (command: CreateNewUserCommand) => Promise<any>;
  changeUserAddress: (command: ChangeUserAddressCommand) => Promise<any>;
}

export interface IAccountCommandHandler {
  commandValidator: (
    command: Command,
    expectedCommandType: ACCOUNT_COMMAND_TYPE
  ) => boolean;
  createNewAccount: (
    command: CreateNewAccountCommand
  ) => Promise<AccountEvent[] | void>;
  changeAccountType: (
    command: ChangeAccountTypeCommand
  ) => Promise<AccountEvent[] | void>;
}

export interface ITransactionCommandCommandHandler {
  commandValidator: (
    command: Command,
    expectedCommandType: TRANSACTION_COMMAND_TYPE
  ) => boolean;
  checkUsersAndAccounts: (params: {
    commandType: TRANSACTION_COMMAND_TYPE;
    receiver_id: string;
    sender_id: string;
    receiver_account_id: string;
    sender_account_id: string;
  }) => Promise<boolean | void>;
  checkAccountBalance: (account_id: string) => Promise<number>;
  transferAmount: (command: TransferAmountCommand) => Promise<any>;
  depositAmount: (command: DepositAmountCommand) => Promise<TransactionEvent[]>;
}

// QUERY HANDLER

export interface IQueryHandler {
  getUserHistory: (user_id: string) => Promise<UserHistoryQueryResult>;
  getUserTransactionsHistory: (
    user_id: string
  ) => Promise<UserTransactionsQueryResult>;
  getUserAccountsInfo: (
    user_id: string
  ) => Promise<UserAccountsInfoQueryResult>;
  getAccountFullHistory: (
    account_id: string
  ) => Promise<AccountFullHistoryQueryResult>;
  getAccountTransactionsHistory: (
    account_id: string
  ) => Promise<AccountTransactionsHistoryQueryResult>;
  getAccountEntityHistory: (
    account_id: string
  ) => Promise<AccountEntityHistoryQueryResult>;
  getAccountBalance: (account_id: string) => Promise<AccountBalanceQueryResult>;
  getTransactionByTransactionId: (
    transaction_id: string
  ) => Promise<TransactionEvent>;
}

// DOMAIN MODELS

export interface IUserDomainModel {
  createNewUser: (command: CreateNewUserCommand) => UserEvent[];
  changeUserAddress(command: ChangeUserAddressCommand): UserEvent[];
}

export interface IAccountDomainModel {
  createNewAccount: (command: CreateNewAccountCommand) => AccountEvent[];
  changeAccountType: (command: ChangeAccountTypeCommand) => AccountEvent[];
}

export interface ITransactionDomainModel {
  transferAmount: (command: TransferAmountCommand) => Event[];
  depositAmount: (command: DepositAmountCommand) => Event[];
}

// REDUCERS

export type AccountReducerFunction = (
  accountEvents: AccountEvent[]
) => Account | void;

export type UserReducerFunction = (userEvents: UserEvent[]) => User | void;

export type BalanceReducerFunction = (
  transactionEvents: TransactionEvent[],
  account_id: string
) => number;

// SEEDER

export type SeederFunction = (models: {
  userEventModel?: Model<UserEvent, {}, {}, {}>;
  accountEventModel?: Model<AccountEvent, {}, {}, {}>;
  transactionEventModel?: Model<TransactionEvent, {}, {}, {}>;
  authorizedUserEventModel?: Model<AuthorizedUser, {}, {}, {}>;
}) => Promise<void>;
