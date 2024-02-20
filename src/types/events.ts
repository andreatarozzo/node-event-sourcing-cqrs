// BASE

export type Event = {
  type: USER_EVENT_TYPE | ACCOUNT_EVENT_TYPE | TRANSACTION_EVENT_TYPE;
  timestamp: Date;
};

export interface UserEvent extends Event {
  user_id: string;
  user_name: string;
  data: UserCreatedEventData | UserAddressChangedEventData;
}

export interface AccountEvent extends Event {
  account_id: string;
  owner_id: string;
  branch_id: string;
  account_type: string;
  is_active: boolean;
  data: AccountCreatedEventData | AccountTypeChangedEventData;
}

export interface TransactionEvent extends Event {
  transaction_id: string;
  sender_id?: string;
  sender_account_id?: string;
  receiver_id: string;
  receiver_account_id: string;
  terminal_id: string;
  branch_id: string;
  amount: number;
  data: AmountTransferredEventData;
}

// USER EVENTS DATA

export interface UserCreatedEventData {
  address: string;
}
export interface UserAddressChangedEventData {
  address: string;
  previous_address: string;
}

// ACCOUNT EVENTS DATA

export interface AccountCreatedEventData {
  initial_balance: number;
}

export interface AccountTypeChangedEventData {
  previous_account_type: string;
}

// TRANSACTION EVENTS DATA

export interface AmountTransferredEventData {}

export interface AmountDepositedEventData {}

// TYPES

export enum USER_EVENT_TYPE {
  USER_CREATED_EVENT = "UserCreatedEvent",
  USER_ADDRESS_CHANGED_EVENT = "UserAddressChangedEvent",
}

export enum ACCOUNT_EVENT_TYPE {
  ACCOUNT_CREATED_EVENT = "AccountCreatedEvent",
  ACCOUNT_TYPE_CHANGED_EVENT = "AccountTypeChangedEvent",
}

export enum TRANSACTION_EVENT_TYPE {
  AMOUNT_TRANSFERRED_EVENT = "AmountTransferredEvent",
  AMOUNT_DEPOSITED_EVENT = "AmountDepositedEvent",
}
