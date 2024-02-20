import testDatabase from "../../test_db_setup";
import { AccountRepository } from "../../../src/repositories/account_repository";
import {
  AccountEvent,
  ACCOUNT_EVENT_TYPE,
  ACCOUNT_TYPE,
  Account,
  AccountCreatedEventData,
  AccountTypeChangedEventData,
} from "../../../src/types";
import { AccountEventModel } from "../../../src/database/models/account_event_db_model";

jest.setTimeout(600000);

// Create new db before each test
beforeAll(async () => {
  await testDatabase.connect();
  await testDatabase.seeder({ accountEventModel: AccountEventModel });
});

// DB Clean Up
afterAll(async () => {
  await testDatabase.closeDatabase();
});

describe("Account Repository", () => {
  const eventsToSave: AccountEvent[] = [
    {
      type: ACCOUNT_EVENT_TYPE.ACCOUNT_CREATED_EVENT,
      account_id: "10",
      owner_id: "12",
      branch_id: "11",
      is_active: true,
      account_type: ACCOUNT_TYPE.PRIVATE,
      timestamp: new Date("2022-02-06T17:52:39.000Z"),
      data: {
        initial_balance: 1000,
      } as AccountCreatedEventData,
    },
    {
      type: ACCOUNT_EVENT_TYPE.ACCOUNT_TYPE_CHANGED_EVENT,
      account_id: "10",
      owner_id: "12",
      branch_id: "11",
      is_active: true,
      account_type: ACCOUNT_TYPE.COMMERCIAL,
      timestamp: new Date("2022-02-07T17:52:39.000Z"),
      data: {
        previous_account_type: ACCOUNT_TYPE.PRIVATE,
      } as AccountTypeChangedEventData,
    },
    {
      type: ACCOUNT_EVENT_TYPE.ACCOUNT_TYPE_CHANGED_EVENT,
      account_id: "11",
      owner_id: "12",
      branch_id: "11",
      is_active: true,
      account_type: ACCOUNT_TYPE.PRIVATE,
      timestamp: new Date("2022-02-08T17:52:39.000Z"),
      data: {
        previous_account_type: ACCOUNT_TYPE.COMMERCIAL,
      } as AccountTypeChangedEventData,
    },
    {
      type: ACCOUNT_EVENT_TYPE.ACCOUNT_CREATED_EVENT,
      account_id: "12",
      owner_id: "13",
      branch_id: "11",
      is_active: true,
      account_type: ACCOUNT_TYPE.COMMERCIAL,
      timestamp: new Date("2022-02-06T17:52:39.000Z"),
      data: {
        initial_balance: 1000,
      } as AccountCreatedEventData,
    },
    {
      type: ACCOUNT_EVENT_TYPE.ACCOUNT_CREATED_EVENT,
      account_id: "13",
      owner_id: "13",
      branch_id: "11",
      is_active: true,
      account_type: ACCOUNT_TYPE.COMMERCIAL,
      timestamp: new Date("2022-02-06T17:52:39.000Z"),
      data: {
        initial_balance: 1000,
      } as AccountCreatedEventData,
    },
  ];

  it("Save Account Events: saveAccountEvents", async () => {
    const eventsSaved = await AccountRepository.saveAccountEvents(eventsToSave);

    const [firstAccountEvent, secondAccountEvent] =
      eventsSaved as AccountEvent[];

    expect(firstAccountEvent.account_id).toBe(eventsToSave[0].account_id);
    expect(firstAccountEvent.account_type).toBe(eventsToSave[0].account_type);
    expect(firstAccountEvent.branch_id).toBe(eventsToSave[0].branch_id);
    expect(firstAccountEvent.owner_id).toBe(eventsToSave[0].owner_id);
    expect(firstAccountEvent.type).toBe(eventsToSave[0].type);
    expect(firstAccountEvent.data).toMatchObject(eventsToSave[0].data);

    expect(secondAccountEvent.account_id).toBe(eventsToSave[1].account_id);
    expect(secondAccountEvent.account_type).toBe(eventsToSave[1].account_type);
    expect(secondAccountEvent.branch_id).toBe(eventsToSave[1].branch_id);
    expect(secondAccountEvent.owner_id).toBe(eventsToSave[1].owner_id);
    expect(secondAccountEvent.type).toBe(eventsToSave[1].type);
    expect(secondAccountEvent.data).toMatchObject(eventsToSave[1].data);
  });

  it("Get Events by Account Id: getEventsByAccountId", async () => {
    const events = await AccountRepository.getEventsByAccountId(
      eventsToSave[0].account_id
    );
    expect(events).toBeTruthy();

    const [accountCreatedEvent, accountTypeChangedEvent] =
      events as AccountEvent[];

    expect(accountCreatedEvent.account_id).toBe(eventsToSave[0].account_id);
    expect(accountCreatedEvent.account_type).toBe(eventsToSave[0].account_type);
    expect(accountCreatedEvent.branch_id).toBe(eventsToSave[0].branch_id);
    expect(accountCreatedEvent.owner_id).toBe(eventsToSave[0].owner_id);
    expect(accountCreatedEvent.type).toBe(eventsToSave[0].type);
    expect(accountCreatedEvent.data).toMatchObject(eventsToSave[0].data);

    expect(accountTypeChangedEvent.account_id).toBe(eventsToSave[1].account_id);
    expect(accountTypeChangedEvent.account_type).toBe(
      eventsToSave[1].account_type
    );
    expect(accountTypeChangedEvent.branch_id).toBe(eventsToSave[1].branch_id);
    expect(accountTypeChangedEvent.owner_id).toBe(eventsToSave[1].owner_id);
    expect(accountTypeChangedEvent.type).toBe(eventsToSave[1].type);
    expect(accountTypeChangedEvent.data).toMatchObject(eventsToSave[1].data);
  });

  it("Get Events by Owner Id: getAccountsByOwnerId", async () => {
    const events = await AccountRepository.getEventsByOwnerId("12");
    expect(events).toBeTruthy();
    expect((events as AccountEvent[]).length).toBe(3);

    const [firstEvent, secondEvent, thirdEvent] = events as AccountEvent[];

    expect(firstEvent.owner_id).toBe("12");
    expect(secondEvent.owner_id).toBe("12");
    expect(thirdEvent.owner_id).toBe("12");

    expect(firstEvent.account_id).toBe("10");
    expect(secondEvent.account_id).toBe("10");
    expect(thirdEvent.account_id).toBe("11");
  });

  it("Get Account by Account Id: getAccountById", async () => {
    const account = await AccountRepository.getAccountById("10");
    expect(account).toBeTruthy();

    expect((account as Account).id).toBe("10");
    expect((account as Account).is_active).toBe(true);
    expect((account as Account).account_type).toBe(ACCOUNT_TYPE.COMMERCIAL);
  });

  it("Get Accounts by Owner Id: getAccountsByOwnerId", async () => {
    const accounts = await AccountRepository.getAccountsByOwnerId("13");
    expect(accounts).toBeTruthy();

    const [accountOne, accountTwo] = accounts as Account[];

    expect(accountOne.id).toBe("12");
    expect(accountOne.is_active).toBe(true);
    expect(accountOne.account_type).toBe(ACCOUNT_TYPE.COMMERCIAL);

    expect(accountTwo.id).toBe("13");
    expect(accountTwo.is_active).toBe(true);
    expect(accountTwo.account_type).toBe(ACCOUNT_TYPE.COMMERCIAL);
  });
});
