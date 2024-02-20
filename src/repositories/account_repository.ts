import { Model } from "mongoose";
import { AccountEventModel } from "../database/models/account_event_db_model";
import {
  Account,
  AccountEvent,
  IAccountRepository,
  AccountReducerFunction,
} from "../types";
import { accountReducer } from "../domain/reducers/account_reducer";

export class AccountRepo implements IAccountRepository {
  accountEventModel: Model<AccountEvent, {}, {}, {}>;
  accountReducer: AccountReducerFunction;

  constructor(
    accountEventModel: Model<AccountEvent, {}, {}, {}>,
    accountReducer: AccountReducerFunction
  ) {
    this.accountEventModel = accountEventModel;
    this.accountReducer = accountReducer;
  }

  /**
   * Get all account's events related to the creation and changes of the account specified.
   * @param account_id
   * @returns
   */
  public async getEventsByAccountId(
    account_id: string
  ): Promise<AccountEvent[] | void> {
    return await this.accountEventModel
      .find({ account_id })
      .sort({ timestamp: 1 });
  }

  /**
   * Get all account's events related to the accounts where the owner id match the one specified
   * in the params.
   * @param owner_id
   * @returns
   */
  public async getEventsByOwnerId(
    owner_id: string
  ): Promise<AccountEvent[] | void> {
    return await this.accountEventModel
      .find({ owner_id })
      .sort({ timestamp: 1 });
  }

  /**
   * Get an account by account id
   * @param account_id
   * @returns
   */
  public async getAccountById(account_id: string): Promise<Account | void> {
    const events = await this.accountEventModel
      .find({ account_id })
      .sort({ timestamp: 1 });
    return this.accountReducer(events);
  }

  /**
   * Get all the accounts for which the owner id matches the owner id provided.
   * @param owner_id
   * @returns
   */
  public async getAccountsByOwnerId(
    owner_id: string
  ): Promise<Account[] | void> {
    const events = await this.accountEventModel
      .find({ owner_id })
      .sort({ timestamp: 1 });
    const accountsEventsCollection: { [key: string]: AccountEvent[] } = {};
    const accounts: Account[] = [];

    events.forEach((event: AccountEvent) => {
      accountsEventsCollection[event.account_id]
        ? accountsEventsCollection[event.account_id].push(event)
        : (accountsEventsCollection[event.account_id] = [event]);
    });

    Object.values(accountsEventsCollection).forEach(
      (eventsCollection: AccountEvent[]) => {
        const current: Account | void = this.accountReducer(eventsCollection);
        if (current) accounts.push(current);
      }
    );

    return accounts;
  }

  /**
   * Saves events to db.
   * @param events
   * @returns
   */
  public async saveAccountEvents(
    events: AccountEvent[]
  ): Promise<AccountEvent[] | void> {
    return await this.accountEventModel.insertMany(events);
  }
}

export const AccountRepository = new AccountRepo(
  AccountEventModel,
  accountReducer
);
