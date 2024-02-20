import { UserDomainModel } from "../../../src/domain/user_domain_model";
import {
  ChangeUserAddressCommand,
  CreateNewUserCommand,
  UserCreatedEventData,
  UserEvent,
  USER_COMMAND_TYPE,
  USER_EVENT_TYPE,
} from "../../../src/types";
import { uuidv4RegExp } from "../../utils";

jest.setTimeout(600000);

describe("User Domain Model", () => {
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
    user_id: "",
    user_name: "Test Name",
    data: {
      address: "New Test Address",
      previous_address: "Test Address",
    },
  };

  it("It generates the USER_CREATED_EVENTs: createNewUser", async () => {
    const events = UserDomainModel.createNewUser(createNewUserCommand);
    expect(events.length).toBe(1);

    const event: UserEvent = events[0];

    expect(event.type).toBe(USER_EVENT_TYPE.USER_CREATED_EVENT);
    expect(event.timestamp.toISOString()).toBe(createNewUserCommand.timestamp);
    expect(event.user_id).toMatch(uuidv4RegExp);
    expect(event.user_name).toBe(createNewUserCommand.user_name);
    expect(event.data).toMatchObject(
      createNewUserCommand.data as UserCreatedEventData
    );
    changeUserAddressCommand.user_id = event.user_id;
  });

  it("It generates the USER_ADDRESS_CHANGED_EVENTs: changeUserAddress", async () => {
    const events = UserDomainModel.changeUserAddress(changeUserAddressCommand);
    expect(events.length).toBe(1);

    const event: UserEvent = events[0];

    expect(event.type).toBe(USER_EVENT_TYPE.USER_ADDRESS_CHANGED_EVENT);
    expect(event.timestamp.toISOString()).toBe(
      changeUserAddressCommand.timestamp
    );
    expect(event.user_id).toMatch(uuidv4RegExp);
    expect(event.user_name).toBe(changeUserAddressCommand.user_name);
    expect(event.data).toMatchObject(
      changeUserAddressCommand.data as UserCreatedEventData
    );
  });
});
