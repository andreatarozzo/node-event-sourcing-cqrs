import testDatabase from "../../test_db_setup";
import { UserEventModel } from "../../../src/database/models/user_event_db_model";
import { UserRepository } from "../../../src/repositories/user_repository";
import { UserEvent, USER_EVENT_TYPE } from "../../../src/types";

jest.setTimeout(600000);

// Create new db before each test
beforeAll(async () => {
  await testDatabase.connect();
  await testDatabase.seeder({ userEventModel: UserEventModel });
});

// DB Clean Up
afterAll(async () => {
  await testDatabase.closeDatabase();
});

describe("User Repository", () => {
  const eventsToSave: UserEvent[] = [
    {
      type: USER_EVENT_TYPE.USER_CREATED_EVENT,
      user_id: "6",
      user_name: "Test User",
      timestamp: new Date("2022-02-06T17:52:39.000Z"),
      data: {
        address: "e",
      },
    },
    {
      type: USER_EVENT_TYPE.USER_ADDRESS_CHANGED_EVENT,
      user_id: "6",
      user_name: "Test User",
      timestamp: new Date("2022-02-06T17:53:39.000Z"),
      data: {
        address: "New Address Unit Test",
        previous_address: "e",
      },
    },
  ];

  it("Save User Events: saveUserEvents", async () => {
    const eventsSaved = await UserRepository.saveUserEvents(eventsToSave);
    expect(eventsSaved as UserEvent[]).toHaveLength(2);

    const [firstEvent, secondEvent] = eventsSaved as UserEvent[];

    expect(firstEvent.user_id).toBe(eventsToSave[0].user_id);
    expect(firstEvent.user_name).toBe(eventsToSave[0].user_name);
    expect(firstEvent.type).toBe(eventsToSave[0].type);
    expect(firstEvent.timestamp.toISOString()).toBe(
      eventsToSave[0].timestamp.toISOString()
    );
    expect(firstEvent.data).toMatchObject(eventsToSave[0].data);

    expect(secondEvent.user_id).toBe(eventsToSave[1].user_id);
    expect(secondEvent.user_name).toBe(eventsToSave[1].user_name);
    expect(secondEvent.type).toBe(eventsToSave[1].type);
    expect(secondEvent.timestamp.toISOString()).toBe(
      eventsToSave[1].timestamp.toISOString()
    );
    expect(secondEvent.data).toMatchObject(eventsToSave[1].data);
  });

  it("Get Events By User Id: getEventsByUserId", async () => {
    const events = await UserRepository.getEventsByUserId("6");
    expect(events).toBeTruthy();
    expect(events).toHaveLength(2);

    const [firstEvent, secondEvent] = events as UserEvent[];

    expect(firstEvent.user_id).toBe(eventsToSave[0].user_id);
    expect(firstEvent.user_name).toBe(eventsToSave[0].user_name);
    expect(firstEvent.type).toBe(eventsToSave[0].type);
    expect(firstEvent.timestamp.toISOString()).toBe(
      eventsToSave[0].timestamp.toISOString()
    );
    expect(firstEvent.data).toMatchObject(eventsToSave[0].data);

    expect(secondEvent.user_id).toBe(eventsToSave[1].user_id);
    expect(secondEvent.user_name).toBe(eventsToSave[1].user_name);
    expect(secondEvent.type).toBe(eventsToSave[1].type);
    expect(secondEvent.timestamp.toISOString()).toBe(
      eventsToSave[1].timestamp.toISOString()
    );
    expect(secondEvent.data).toMatchObject(eventsToSave[1].data);
  });

  it("Get User By Id: getUserById", async () => {
    const user = await UserRepository.getUserById("6");
    expect(user).toMatchObject({
      id: "6",
      name: "Test User",
      address: "New Address Unit Test",
    });
  });
});
