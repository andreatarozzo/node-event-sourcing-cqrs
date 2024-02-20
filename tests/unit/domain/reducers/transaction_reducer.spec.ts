import {
  TransactionEvent,
  TRANSACTION_EVENT_TYPE,
} from "../../../../src/types";
import { transactionBalanceReducer } from "../../../../src/domain/reducers/transaction_reducer";

describe("Transaction Reducer", () => {
  const accountEvents: TransactionEvent[] = [
    {
      type: TRANSACTION_EVENT_TYPE.AMOUNT_DEPOSITED_EVENT,
      transaction_id: "12",
      receiver_id: "13",
      receiver_account_id: "1",
      terminal_id: "1",
      branch_id: "1",
      amount: 100,
      timestamp: new Date("2022-02-05T17:52:39.000Z"),
      data: {},
    },
    {
      type: TRANSACTION_EVENT_TYPE.AMOUNT_TRANSFERRED_EVENT,
      transaction_id: "11",
      sender_id: "10",
      sender_account_id: "1",
      receiver_id: "11",
      receiver_account_id: "12",
      terminal_id: "1",
      branch_id: "1",
      amount: 0.5,
      timestamp: new Date("2022-02-06T17:52:39.000Z"),
      data: {},
    },
    {
      type: TRANSACTION_EVENT_TYPE.AMOUNT_TRANSFERRED_EVENT,
      transaction_id: "12",
      sender_id: "12",
      sender_account_id: "12",
      receiver_id: "13",
      receiver_account_id: "1",
      terminal_id: "1",
      branch_id: "1",
      amount: 5,
      timestamp: new Date("2022-02-06T17:52:39.000Z"),
      data: {},
    },
  ];

  it("Can reduce the events to an account balance", () => {
    const balance = transactionBalanceReducer(accountEvents, "1");
    expect(balance).toBe(104.5);
  });
});
