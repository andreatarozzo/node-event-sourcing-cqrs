// Query Result Types

import {
  Account,
  User,
  AccountEvent,
  UserEvent,
  TransactionEvent,
} from "./index";

// USER QUERY RESULTS

export interface UserHistoryQueryResult {
  user: User;
  history: UserEvent[];
}

export interface UserTransactionsQueryResult {
  user: User;
  transactions_history: TransactionEvent[];
}

export interface UserAccountsInfoQueryResult {
  user: User;
  accounts: Account[];
}

// ACCOUNT QUERY RESULTS

export interface AccountFullHistoryQueryResult {
  account: Account;
  balance: number;
  account_history: AccountEvent[];
  transactions_history: TransactionEvent[];
}

export interface AccountTransactionsHistoryQueryResult {
  account: Account;
  transactions_history: TransactionEvent[];
}

export interface AccountBalanceQueryResult {
  account_id: string;
  balance: number;
}

export interface AccountEntityHistoryQueryResult {
  account: Account;
  history: AccountEvent[];
}

// TRANSACTION QUERY RESULTS
