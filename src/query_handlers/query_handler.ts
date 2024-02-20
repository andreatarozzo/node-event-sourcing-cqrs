import { AccountRepository } from "../repositories/account_repository";
import { TransactionRepository } from "../repositories/transaction_repository";
import { UserRepository } from "../repositories/user_repository";
import {
  Account,
  AccountBalanceQueryResult,
  AccountEntityHistoryQueryResult,
  AccountFullHistoryQueryResult,
  AccountTransactionsHistoryQueryResult,
  IAccountRepository,
  IQueryHandler,
  ITransactionRepository,
  IUserRepository,
  TransactionEvent,
  User,
  UserAccountsInfoQueryResult,
  UserEvent,
  UserHistoryQueryResult,
  UserTransactionsQueryResult,
} from "../types";
import {
  AccountNotFoundError,
  InvalidQueryError,
  TransactionNotFound,
  UserNotFoundError,
} from "../utils/errors";

class QueryHandler implements IQueryHandler {
  userRepository: IUserRepository;
  accountRepository: IAccountRepository;
  transactionRepository: ITransactionRepository;

  constructor(
    userRepository: IUserRepository,
    accountRepository: IAccountRepository,
    transactionRepository: ITransactionRepository
  ) {
    this.userRepository = userRepository;
    this.accountRepository = accountRepository;
    this.transactionRepository = transactionRepository;
  }

  /**
   * Provides all users
   * @throws {UserNotFoundError}
   * @returns {} {user, history}
   */
  public async getUsers(): Promise<User[]> {
    const userEvents = await this.userRepository.getUsersEvents();
    if (!userEvents || userEvents.length === 0) throw new UserNotFoundError();

    const sorted: { [key: string]: UserEvent[] } = {};

    userEvents.forEach((event: UserEvent) => {
      sorted[event.user_id]
        ? sorted[event.user_id].push(event)
        : (sorted[event.user_id] = [event]);
    });

    const users: User[] = [];

    Object.values(sorted).forEach((events: UserEvent[]) => {
      const user: User = this.userRepository.userReducer(events) as User;
      users.push(user);
    });

    return users;
  }

  /**
   * Provides and object containing the user entity current state and the events related
   * to the user profile changes
   * @param user_id
   * @throws {InvalidQueryError | UserNotFoundError}
   * @returns {} {user, history}
   */
  public async getUserHistory(
    user_id: string
  ): Promise<UserHistoryQueryResult> {
    if (!user_id) throw new InvalidQueryError();

    const userEvents = await this.userRepository.getEventsByUserId(user_id);
    if (!userEvents || userEvents.length === 0) throw new UserNotFoundError();

    const user = this.userRepository.userReducer(userEvents) as User;

    return {
      user,
      history: userEvents,
    };
  }

  /**
   * Provides and object containing the user entity current state and the user transactions history.
   * @param user_id
   * @throws {InvalidQueryError | UserNotFoundError}
   * @returns {} {user, transactions_history}
   */
  public async getUserTransactionsHistory(
    user_id: string
  ): Promise<UserTransactionsQueryResult> {
    if (!user_id) throw new InvalidQueryError();

    const userEvents = await this.userRepository.getEventsByUserId(user_id);
    if (!userEvents || userEvents.length === 0) throw new UserNotFoundError();

    const user = this.userRepository.userReducer(userEvents) as User;
    const transactions = await this.transactionRepository.getEventsByUserId(
      user_id
    );

    return {
      user,
      transactions_history: transactions as TransactionEvent[],
    };
  }

  /**
   * Provides and object containing the user entity current state and a list of all accounts
   * associated with the user.
   * @param user_id
   * @throws {InvalidQueryError | UserNotFoundError}
   * @returns {} {user, accounts}
   */
  public async getUserAccountsInfo(
    user_id: string
  ): Promise<UserAccountsInfoQueryResult> {
    if (!user_id) throw new InvalidQueryError();

    const userEvents = await this.userRepository.getEventsByUserId(user_id);
    if (!userEvents || userEvents.length === 0) throw new UserNotFoundError();

    const user = this.userRepository.userReducer(userEvents) as User;
    const accounts = await this.accountRepository.getAccountsByOwnerId(user_id);

    return {
      user,
      accounts: accounts as Account[],
    };
  }

  /**
   * Provides and object containing the account entity current state, its balance alongside the
   * account_history and transactions_history of the account.
   * @param account_id
   * @throws {InvalidQueryError | AccountNotFoundError}
   * @returns {} {account, balance, account_history, transactions_history}
   */
  public async getAccountFullHistory(
    account_id: string
  ): Promise<AccountFullHistoryQueryResult> {
    if (!account_id) throw new InvalidQueryError();

    const accountEvents = await this.accountRepository.getEventsByAccountId(
      account_id
    );
    if (!accountEvents || accountEvents.length === 0)
      throw new AccountNotFoundError();

    const account = this.accountRepository.accountReducer(accountEvents);
    const transactionEvents =
      await this.transactionRepository.getEventsByAccountId(account_id);
    const balance = this.transactionRepository.balanceReducer(
      transactionEvents!,
      account_id
    );

    return {
      account: account as Account,
      balance,
      account_history: accountEvents,
      transactions_history: transactionEvents!,
    };
  }

  /**
   * Provides and object containing the account entity current state and its transactions history.
   * @param account_id
   * @throws {InvalidQueryError | AccountNotFoundError}
   * @returns {} {account_id, transactions_history}
   */
  public async getAccountTransactionsHistory(
    account_id: string
  ): Promise<AccountTransactionsHistoryQueryResult> {
    if (!account_id) throw new InvalidQueryError();

    const accountEvents = await this.accountRepository.getEventsByAccountId(
      account_id
    );
    if (!accountEvents || accountEvents.length === 0)
      throw new AccountNotFoundError();
    const transactionEvents =
      await this.transactionRepository.getEventsByAccountId(account_id);

    const account = this.accountRepository.accountReducer(accountEvents);

    return {
      account: account as Account,
      transactions_history: transactionEvents!,
    };
  }

  /**
   * Provides and object containing the account entity current state and its history.
   * @param account_id
   * @throws {InvalidQueryError | AccountNotFoundError}
   * @returns {} {account_id, transactions_history}
   */
  public async getAccountEntityHistory(
    account_id: string
  ): Promise<AccountEntityHistoryQueryResult> {
    if (!account_id) throw new InvalidQueryError();

    const accountEvents = await this.accountRepository.getEventsByAccountId(
      account_id
    );
    if (!accountEvents || accountEvents.length === 0)
      throw new AccountNotFoundError();

    const account = this.accountRepository.accountReducer(accountEvents);

    return {
      account: account as Account,
      history: accountEvents,
    };
  }

  /**
   * Provides and object containing the account id and its balance.
   * @param account_id
   * @throws {InvalidQueryError | AccountNotFoundError}
   * @returns {} {account_id, transactions_history}
   */
  public async getAccountBalance(
    account_id: string
  ): Promise<AccountBalanceQueryResult> {
    if (!account_id) throw new InvalidQueryError();

    const accountEvents = await this.accountRepository.getEventsByAccountId(
      account_id
    );
    if (!accountEvents || accountEvents.length === 0)
      throw new AccountNotFoundError();

    const transactionEvents =
      await this.transactionRepository.getEventsByAccountId(account_id);
    const balance = this.transactionRepository.balanceReducer(
      transactionEvents!,
      account_id
    );

    return {
      account_id: account_id,
      balance,
    };
  }

  /**
   * Returns the Transaction Event associated with the transaction_id provided
   * @param transaction_id
   * @throws {InvalidQueryError | TransactionNotFound}
   * @returns {} {account_id, transactions_history}
   */
  public async getTransactionByTransactionId(
    transaction_id: string
  ): Promise<TransactionEvent> {
    if (!transaction_id) throw new InvalidQueryError();

    const transaction =
      await this.transactionRepository.getTransactionByTransactionId(
        transaction_id
      );
    if (!transaction) throw new TransactionNotFound();

    return transaction;
  }
}

export const queryHandler = new QueryHandler(
  UserRepository,
  AccountRepository,
  TransactionRepository
);
