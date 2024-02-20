import testDatabase from "../test_db_setup";
import { TransactionEventModel } from "../../src/database/models/transaction_event_db_model";
import { UserEventModel } from "../../src/database/models/user_event_db_model";
import { AccountEventModel } from "../../src/database/models/account_event_db_model";
import { queryHandler } from "../../src/query_handlers/query_handler";
import {
  AccountBalanceQueryResult,
  AccountEntityHistoryQueryResult,
  AccountFullHistoryQueryResult,
  AccountTransactionsHistoryQueryResult,
  TransactionEvent,
  UserAccountsInfoQueryResult,
  UserHistoryQueryResult,
  UserTransactionsQueryResult,
} from "../../src/types";
import {
  AccountNotFoundError,
  InvalidQueryError,
  TransactionNotFound,
  UserNotFoundError,
} from "../../src/utils/errors";

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

describe("Query Handler", () => {
  it("Get User History: getUserHistory", async () => {
    const result = (await queryHandler.getUserHistory(
      "1"
    )) as UserHistoryQueryResult;
    expect(result.user.id).toBe("1");
    expect(result.history).toHaveLength(1);
  });

  it("Invalid Query when no parameters are passed: getUserHistory", async () => {
    try {
      await queryHandler.getUserHistory("");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof InvalidQueryError).toBe(true);
    }
  });

  it("User Not Found error: getUserHistory", async () => {
    try {
      await queryHandler.getUserHistory("_not_found");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof UserNotFoundError).toBe(true);
    }
  });

  it("Get User Transaction History: getUserTransactionsHistory", async () => {
    const result = (await queryHandler.getUserTransactionsHistory(
      "1"
    )) as UserTransactionsQueryResult;
    expect(result.user.id).toBe("1");
    expect(result.transactions_history).toHaveLength(2);
  });

  it("Invalid Query when no parameters are passed: getUserTransactionsHistory", async () => {
    try {
      await queryHandler.getUserTransactionsHistory("");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof InvalidQueryError).toBe(true);
    }
  });

  it("User Not Found error: getUserTransactionsHistory", async () => {
    try {
      await queryHandler.getUserTransactionsHistory("_not_found");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof UserNotFoundError).toBe(true);
    }
  });

  it("Get User Accounts Info: getUserAccountsInfo", async () => {
    const result = (await queryHandler.getUserAccountsInfo(
      "1"
    )) as UserAccountsInfoQueryResult;
    expect(result.user.id).toBe("1");
    expect(result.accounts).toHaveLength(1);
  });

  it("Invalid Query when no parameters are passed: getUserTransactionsHistory", async () => {
    try {
      await queryHandler.getUserAccountsInfo("");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof InvalidQueryError).toBe(true);
    }
  });

  it("User Not Found error: getUserTransactionsHistory", async () => {
    try {
      await queryHandler.getUserAccountsInfo("_not_found");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof UserNotFoundError).toBe(true);
    }
  });

  it("Get Account Full History: getAccountFullHistory", async () => {
    const result = (await queryHandler.getAccountFullHistory(
      "1"
    )) as AccountFullHistoryQueryResult;
    expect(result.account.id).toBe("1");
    expect(result.balance).toBe(9990.12);
    expect(result.account_history).toHaveLength(1);
    expect(result.transactions_history).toHaveLength(2);
  });

  it("Invalid Query when no parameters are passed: getAccountFullHistory", async () => {
    try {
      await queryHandler.getAccountFullHistory("");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof InvalidQueryError).toBe(true);
    }
  });

  it("Account Not Found error: getAccountFullHistory", async () => {
    try {
      await queryHandler.getAccountFullHistory("_not_found");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof AccountNotFoundError).toBe(true);
    }
  });

  it("Get Account Transaction History: getAccountTransactionsHistory", async () => {
    const result = (await queryHandler.getAccountTransactionsHistory(
      "1"
    )) as AccountTransactionsHistoryQueryResult;
    expect(result.account.id).toBe("1");
    expect(result.transactions_history).toHaveLength(2);
  });

  it("Invalid Query when no parameters are passed: getAccountTransactionsHistory", async () => {
    try {
      await queryHandler.getAccountTransactionsHistory("");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof InvalidQueryError).toBe(true);
    }
  });

  it("Account Not Found error: getAccountTransactionsHistory", async () => {
    try {
      await queryHandler.getAccountTransactionsHistory("_not_found");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof AccountNotFoundError).toBe(true);
    }
  });

  it("Get Account Entity History: getAccountEntityHistory", async () => {
    const result = (await queryHandler.getAccountEntityHistory(
      "1"
    )) as AccountEntityHistoryQueryResult;
    expect(result.account.id).toBe("1");
    expect(result.history).toHaveLength(1);
  });

  it("Invalid Query when no parameters are passed: getAccountEntityHistory", async () => {
    try {
      await queryHandler.getAccountEntityHistory("");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof InvalidQueryError).toBe(true);
    }
  });

  it("Account Not Found error: getAccountEntityHistory", async () => {
    try {
      await queryHandler.getAccountEntityHistory("_not_found");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof AccountNotFoundError).toBe(true);
    }
  });

  it("Get Account Balance: getAccountBalance", async () => {
    const result = (await queryHandler.getAccountBalance(
      "1"
    )) as AccountBalanceQueryResult;
    expect(result.account_id).toBe("1");
    expect(result.balance).toBe(9990.12);
  });

  it("Invalid Query when no parameters are passed: getAccountBalance", async () => {
    try {
      await queryHandler.getAccountBalance("");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof InvalidQueryError).toBe(true);
    }
  });

  it("Account Not Found error: getAccountBalance", async () => {
    try {
      await queryHandler.getAccountBalance("_not_found");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof AccountNotFoundError).toBe(true);
    }
  });

  it("Get Transaction by Transaction Id: getTransactionByTransactionId", async () => {
    const result = (await queryHandler.getTransactionByTransactionId(
      "1"
    )) as TransactionEvent;
    expect(result.transaction_id).toBe("1");
  });

  it("Invalid Query when no parameters are passed: getTransactionByTransactionId", async () => {
    try {
      await queryHandler.getTransactionByTransactionId("");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof InvalidQueryError).toBe(true);
    }
  });

  it("Transaction Not Found error: getTransactionByTransactionId", async () => {
    try {
      await queryHandler.getTransactionByTransactionId("_not_found");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof TransactionNotFound).toBe(true);
    }
  });
});
