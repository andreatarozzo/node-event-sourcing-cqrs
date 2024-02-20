import testDatabase from "../../test_db_setup";
import { TransactionRepository } from "../../../src/repositories/transaction_repository";
import { TransactionEvent, TRANSACTION_EVENT_TYPE } from "../../../src/types";
import { TransactionEventModel } from "../../../src/database/models/transaction_event_db_model";

jest.setTimeout(600000);

// Create new db before each test
beforeAll(async () => {
  await testDatabase.connect();
  await testDatabase.seeder({ transactionEventModel: TransactionEventModel });
});

// DB Clean Up
afterAll(async () => {
  await testDatabase.closeDatabase();
});

describe("Transaction Repository", () => {
  const eventsToSave: TransactionEvent[] = [
    {
      type: TRANSACTION_EVENT_TYPE.AMOUNT_TRANSFERRED_EVENT,
      transaction_id: "11",
      sender_id: "10",
      sender_account_id: "10",
      receiver_id: "11",
      receiver_account_id: "1",
      terminal_id: "1",
      branch_id: "1",
      amount: 10.12,
      timestamp: new Date("2022-02-06T17:52:39.000Z"),
      data: {},
    },
    {
      type: TRANSACTION_EVENT_TYPE.AMOUNT_TRANSFERRED_EVENT,
      transaction_id: "12",
      sender_id: "12",
      sender_account_id: "12",
      receiver_id: "13",
      receiver_account_id: "13",
      terminal_id: "1",
      branch_id: "1",
      amount: 10.12,
      timestamp: new Date("2022-02-06T17:52:39.000Z"),
      data: {},
    },
  ];

  const depositEventsToSave: TransactionEvent[] = [
    {
      type: TRANSACTION_EVENT_TYPE.AMOUNT_DEPOSITED_EVENT,
      transaction_id: "12",
      receiver_id: "13",
      receiver_account_id: "10",
      terminal_id: "1",
      branch_id: "1",
      amount: 10.12,
      timestamp: new Date("2022-02-05T17:52:39.000Z"),
      data: {},
    },
    {
      type: TRANSACTION_EVENT_TYPE.AMOUNT_DEPOSITED_EVENT,
      transaction_id: "12",
      receiver_id: "10",
      receiver_account_id: "10",
      terminal_id: "1",
      branch_id: "1",
      amount: 1000,
      timestamp: new Date("2022-02-07T17:52:39.000Z"),
      data: {},
    },
  ];

  it("Save Transaction Events: saveTransactionEvents", async () => {
    const eventsSaved = await TransactionRepository.saveTransactionEvents([
      ...eventsToSave,
      ...depositEventsToSave,
    ]);
    expect(eventsSaved as TransactionEvent[]).toHaveLength(4);

    const [firstTransaction, secondTransaction, firstDeposit] =
      eventsSaved as TransactionEvent[];

    expect(firstTransaction.type).toBe(eventsToSave[0].type);
    expect(firstTransaction.transaction_id).toBe(
      eventsToSave[0].transaction_id
    );
    expect(firstTransaction.sender_id).toBe(eventsToSave[0].sender_id);
    expect(firstTransaction.sender_account_id).toBe(
      eventsToSave[0].sender_account_id
    );
    expect(firstTransaction.receiver_id).toBe(eventsToSave[0].receiver_id);
    expect(firstTransaction.receiver_account_id).toBe(
      eventsToSave[0].receiver_account_id
    );
    expect(firstTransaction.terminal_id).toBe(eventsToSave[0].terminal_id);
    expect(firstTransaction.branch_id).toBe(eventsToSave[0].branch_id);
    expect(firstTransaction.timestamp.toISOString()).toBe(
      eventsToSave[0].timestamp.toISOString()
    );
    expect(firstTransaction.data).toMatchObject(eventsToSave[0].data);

    expect(secondTransaction.type).toBe(eventsToSave[1].type);
    expect(secondTransaction.transaction_id).toBe(
      eventsToSave[1].transaction_id
    );
    expect(secondTransaction.sender_id).toBe(eventsToSave[1].sender_id);
    expect(secondTransaction.sender_account_id).toBe(
      eventsToSave[1].sender_account_id
    );
    expect(secondTransaction.receiver_id).toBe(eventsToSave[1].receiver_id);
    expect(secondTransaction.receiver_account_id).toBe(
      eventsToSave[1].receiver_account_id
    );
    expect(secondTransaction.terminal_id).toBe(eventsToSave[1].terminal_id);
    expect(secondTransaction.branch_id).toBe(eventsToSave[1].branch_id);
    expect(secondTransaction.timestamp.toISOString()).toBe(
      eventsToSave[1].timestamp.toISOString()
    );
    expect(secondTransaction.data).toMatchObject(eventsToSave[1].data);

    expect(firstDeposit.type).toBe(depositEventsToSave[0].type);
    expect(firstDeposit.transaction_id).toBe(
      depositEventsToSave[0].transaction_id
    );
    expect(firstDeposit.receiver_id).toBe(depositEventsToSave[0].receiver_id);
    expect(firstDeposit.receiver_account_id).toBe(
      depositEventsToSave[0].receiver_account_id
    );
    expect(firstDeposit.terminal_id).toBe(depositEventsToSave[0].terminal_id);
    expect(firstDeposit.branch_id).toBe(depositEventsToSave[0].branch_id);
    expect(firstDeposit.timestamp.toISOString()).toBe(
      depositEventsToSave[0].timestamp.toISOString()
    );
    expect(firstDeposit.data).toMatchObject(depositEventsToSave[0].data);
  });

  it("Get Events By Sender Id: getEventsBySenderId", async () => {
    const events = await TransactionRepository.getEventsBySenderId("10");
    expect(events).toBeTruthy();

    const transaction: TransactionEvent = (events as TransactionEvent[])[0];
    expect(transaction.sender_id).toBe("10");
  });

  it("Get Events By Receiver Id: getEventsByReceiverId", async () => {
    const events = await TransactionRepository.getEventsByReceiverId("11");
    expect(events).toBeTruthy();

    const transaction: TransactionEvent = (events as TransactionEvent[])[0];
    expect(transaction.receiver_id).toBe("11");
  });

  it("Get Events By Sender Account Id: getEventsBySenderAccountId", async () => {
    const events = await TransactionRepository.getEventsBySenderAccountId("10");
    expect(events).toBeTruthy();

    const transaction: TransactionEvent = (events as TransactionEvent[])[0];
    expect(transaction.sender_account_id).toBe("10");
  });

  it("Get Events By Receiver Account Id: getEventsByReceiverAccountId", async () => {
    const events = await TransactionRepository.getEventsByReceiverAccountId(
      "1"
    );
    expect(events).toBeTruthy();

    const transaction: TransactionEvent = (events as TransactionEvent[])[0];
    expect(transaction.receiver_account_id).toBe("1");
  });

  it("Get Events By Account Id: getEventsByAccountId", async () => {
    const events = await TransactionRepository.getEventsByAccountId("10");
    expect(events).toBeTruthy();

    const [firstDeposit, firstTransaction] = events as TransactionEvent[];

    expect(firstTransaction.type).toBe(eventsToSave[0].type);
    expect(firstTransaction.transaction_id).toBe(
      eventsToSave[0].transaction_id
    );
    expect(firstTransaction.sender_id).toBe(eventsToSave[0].sender_id);
    expect(firstTransaction.sender_account_id).toBe(
      eventsToSave[0].sender_account_id
    );
    expect(firstTransaction.receiver_id).toBe(eventsToSave[0].receiver_id);
    expect(firstTransaction.receiver_account_id).toBe(
      eventsToSave[0].receiver_account_id
    );
    expect(firstTransaction.terminal_id).toBe(eventsToSave[0].terminal_id);
    expect(firstTransaction.branch_id).toBe(eventsToSave[0].branch_id);
    expect(firstTransaction.timestamp.toISOString()).toBe(
      eventsToSave[0].timestamp.toISOString()
    );
    expect(firstTransaction.data).toMatchObject(eventsToSave[0].data);

    expect(firstDeposit.type).toBe(depositEventsToSave[0].type);
    expect(firstDeposit.transaction_id).toBe(
      depositEventsToSave[0].transaction_id
    );
    expect(firstDeposit.receiver_id).toBe(depositEventsToSave[0].receiver_id);
    expect(firstDeposit.receiver_account_id).toBe(
      depositEventsToSave[0].receiver_account_id
    );
    expect(firstDeposit.terminal_id).toBe(depositEventsToSave[0].terminal_id);
    expect(firstDeposit.branch_id).toBe(depositEventsToSave[0].branch_id);
    expect(firstDeposit.timestamp.toISOString()).toBe(
      depositEventsToSave[0].timestamp.toISOString()
    );
    expect(firstDeposit.data).toMatchObject(depositEventsToSave[0].data);
  });

  it("Get Events By User Id: getEventsByUserId", async () => {
    const events = await TransactionRepository.getEventsByUserId("10");
    expect(events).toBeTruthy();

    const [firstTransaction, firstDeposit] = events as TransactionEvent[];

    expect(firstTransaction.type).toBe(eventsToSave[0].type);
    expect(firstTransaction.transaction_id).toBe(
      eventsToSave[0].transaction_id
    );
    expect(firstTransaction.sender_id).toBe(eventsToSave[0].sender_id);
    expect(firstTransaction.sender_account_id).toBe(
      eventsToSave[0].sender_account_id
    );
    expect(firstTransaction.receiver_id).toBe(eventsToSave[0].receiver_id);
    expect(firstTransaction.receiver_account_id).toBe(
      eventsToSave[0].receiver_account_id
    );
    expect(firstTransaction.terminal_id).toBe(eventsToSave[0].terminal_id);
    expect(firstTransaction.branch_id).toBe(eventsToSave[0].branch_id);
    expect(firstTransaction.timestamp.toISOString()).toBe(
      eventsToSave[0].timestamp.toISOString()
    );
    expect(firstTransaction.data).toMatchObject(eventsToSave[0].data);

    expect(firstDeposit.type).toBe(depositEventsToSave[1].type);
    expect(firstDeposit.transaction_id).toBe(
      depositEventsToSave[1].transaction_id
    );
    expect(firstDeposit.receiver_id).toBe(depositEventsToSave[1].receiver_id);
    expect(firstDeposit.receiver_account_id).toBe(
      depositEventsToSave[1].receiver_account_id
    );
    expect(firstDeposit.terminal_id).toBe(depositEventsToSave[1].terminal_id);
    expect(firstDeposit.branch_id).toBe(depositEventsToSave[1].branch_id);
    expect(firstDeposit.timestamp.toISOString()).toBe(
      depositEventsToSave[1].timestamp.toISOString()
    );
    expect(firstDeposit.data).toMatchObject(depositEventsToSave[1].data);
  });

  it("Get Transaction By Transaction Id: getTransactionByTransactionId", async () => {
    const event = (await TransactionRepository.getTransactionByTransactionId(
      "12"
    )) as TransactionEvent;
    expect(event).toBeTruthy();

    expect(event.type).toBe(eventsToSave[1].type);
    expect(event.transaction_id).toBe(eventsToSave[1].transaction_id);
    expect(event.sender_id).toBe(eventsToSave[1].sender_id);
    expect(event.sender_account_id).toBe(eventsToSave[1].sender_account_id);
    expect(event.receiver_id).toBe(eventsToSave[1].receiver_id);
    expect(event.receiver_account_id).toBe(eventsToSave[1].receiver_account_id);
    expect(event.terminal_id).toBe(eventsToSave[1].terminal_id);
    expect(event.branch_id).toBe(eventsToSave[1].branch_id);
    expect(event.timestamp.toISOString()).toBe(
      eventsToSave[1].timestamp.toISOString()
    );
    expect(event.data).toMatchObject(eventsToSave[1].data);
  });
});
