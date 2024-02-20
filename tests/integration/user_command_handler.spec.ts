import testDatabase from "../test_db_setup";
import { UserEventModel } from "../../src/database/models/user_event_db_model";
import { uuidv4RegExp } from "../utils";
import {
  ChangeUserAddressCommand,
  CreateNewUserCommand,
  UserAddressChangedEventData,
  UserCreatedEventData,
  UserEvent,
  USER_COMMAND_TYPE,
  USER_EVENT_TYPE,
} from "../../src/types";
import { UserCommandHandler } from "../../src/command_handlers/user_command_handler";
import {
  InvalidCommandError,
  NoEventsGeneratedError,
  UserNotFoundError,
} from "../../src/utils/errors";

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

describe("User Command Handler", () => {
  const createNewUserCommand: CreateNewUserCommand = {
    type: USER_COMMAND_TYPE.CREATE_NEW_USER_COMMAND,
    timestamp: "2022-02-07T17:52:39.000Z",
    user_name: "Test Name",
    data: {
      address: "Test Address",
    },
  };

  const changeUserAddressCommand: ChangeUserAddressCommand = {
    type: USER_COMMAND_TYPE.CHANGE_USER_ADDRESS_COMMAND,
    timestamp: "2022-02-07T17:52:39.000Z",
    user_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    user_name: "Test Name",
    data: {
      address: "New Test Address",
      previous_address: "Test Address",
    },
  };

  it("Validator with valid Command", async () => {
    const isValid = UserCommandHandler.commandValidator(
      createNewUserCommand,
      USER_COMMAND_TYPE.CREATE_NEW_USER_COMMAND
    );
    expect(isValid).toBe(true);
  });

  it("Validator with invalid Command: missing values", async () => {
    const isValid = UserCommandHandler.commandValidator(
      {} as CreateNewUserCommand,
      USER_COMMAND_TYPE.CREATE_NEW_USER_COMMAND
    );
    expect(isValid).toBe(false);
  });

  it("Validator with invalid Command: wrong command provided", async () => {
    const isValid = UserCommandHandler.commandValidator(
      changeUserAddressCommand,
      USER_COMMAND_TYPE.CREATE_NEW_USER_COMMAND
    );
    expect(isValid).toBe(false);
  });

  it("Invalid Command Error is thrown: createNewUser", async () => {
    try {
      await UserCommandHandler.createNewUser({} as CreateNewUserCommand);
      fail("No error was thrown");
    } catch (e) {
      return expect(e instanceof InvalidCommandError).toBe(true);
    }
  });

  it("Invalid Command Error is thrown: changeUserAddress", async () => {
    try {
      await UserCommandHandler.changeUserAddress(
        {} as ChangeUserAddressCommand
      );
      fail("No error was thrown");
    } catch (e) {
      return expect(e instanceof InvalidCommandError).toBe(true);
    }
  });

  it("No Events generated Error: createNewUser", async () => {
    jest
      .spyOn(UserCommandHandler.userDomainModel, "createNewUser")
      .mockImplementationOnce(
        (command: CreateNewUserCommand) => [] as UserEvent[]
      );

    try {
      await UserCommandHandler.createNewUser(createNewUserCommand);
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof NoEventsGeneratedError).toBe(true);
    }
  });

  it("No Events generated Error: changeUserAddress", async () => {
    jest
      .spyOn(UserCommandHandler.userDomainModel, "changeUserAddress")
      .mockImplementationOnce(
        (command: ChangeUserAddressCommand) => [] as UserEvent[]
      );

    try {
      await UserCommandHandler.changeUserAddress(changeUserAddressCommand);
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof NoEventsGeneratedError).toBe(true);
    }
  });

  it("No User found Error: changeUserAddress", async () => {
    const changeAddressCommand: ChangeUserAddressCommand = JSON.parse(
      JSON.stringify(changeUserAddressCommand)
    );
    changeAddressCommand.user_id = "test";

    try {
      await UserCommandHandler.changeUserAddress(changeAddressCommand);
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof UserNotFoundError).toBe(true);
    }
  });

  it("Create New User Command Handling: createNewUser", async () => {
    const eventsSaved = await UserCommandHandler.createNewUser(
      createNewUserCommand
    );
    expect(eventsSaved as UserEvent[]).toHaveLength(1);

    const userCreatedEvent: UserEvent = (eventsSaved as UserEvent[])[0];

    expect(userCreatedEvent.type).toBe(USER_EVENT_TYPE.USER_CREATED_EVENT);
    expect(userCreatedEvent.user_id).toMatch(uuidv4RegExp);
    expect(userCreatedEvent.user_name).toBe(createNewUserCommand.user_name);
    expect(userCreatedEvent.timestamp.toISOString()).toBe(
      createNewUserCommand.timestamp
    );
    expect(userCreatedEvent.data).toMatchObject(
      createNewUserCommand.data as UserCreatedEventData
    );
  });

  it("Change User Address Command Handling: createNewUser", async () => {
    const eventsSaved = await UserCommandHandler.changeUserAddress(
      changeUserAddressCommand
    );

    expect(eventsSaved as UserEvent[]).toHaveLength(1);

    const userAddressChangedEvent: UserEvent = (eventsSaved as UserEvent[])[0];

    expect(userAddressChangedEvent.type).toBe(
      USER_EVENT_TYPE.USER_ADDRESS_CHANGED_EVENT
    );
    expect(userAddressChangedEvent.user_id).toBe(
      changeUserAddressCommand.user_id
    );
    expect(userAddressChangedEvent.user_name).toBe(
      changeUserAddressCommand.user_name
    );
    expect(userAddressChangedEvent.timestamp.toISOString()).toBe(
      changeUserAddressCommand.timestamp
    );
    expect(userAddressChangedEvent.data).toMatchObject(
      changeUserAddressCommand.data as UserAddressChangedEventData
    );
  });
});
