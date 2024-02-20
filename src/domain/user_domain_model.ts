import {
  ChangeUserAddressCommand,
  CreateNewUserCommand,
  IUserDomainModel,
  UserAddressChangedEventData,
  UserCreatedEventData,
  UserEvent,
  USER_EVENT_TYPE,
} from "../types";
import { v4 as uuidv4 } from "uuid";

export class UserModel implements IUserDomainModel {
  constructor() {}

  /**
   * Generates the events related to a command to create a new user
   * @param command
   * @returns
   */
  public createNewUser(command: CreateNewUserCommand): UserEvent[] {
    return [
      {
        type: USER_EVENT_TYPE.USER_CREATED_EVENT,
        user_id: uuidv4(),
        user_name: command.user_name,
        timestamp: new Date(command.timestamp),
        data: command.data as UserCreatedEventData,
      } as UserEvent,
    ];
  }

  /**
   * Generates the events related to a command to change a user address
   * @param command
   * @returns
   */
  public changeUserAddress(command: ChangeUserAddressCommand): UserEvent[] {
    return [
      {
        type: USER_EVENT_TYPE.USER_ADDRESS_CHANGED_EVENT,
        timestamp: new Date(command.timestamp),
        user_id: command.user_id,
        user_name: command.user_name,
        data: command.data as UserAddressChangedEventData,
      } as UserEvent,
    ];
  }
}

export const UserDomainModel = new UserModel();
