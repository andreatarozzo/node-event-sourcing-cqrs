import { UserDomainModel } from "../domain/user_domain_model";
import { UserRepository } from "../repositories/user_repository";
import {
  ChangeUserAddressCommand,
  Command,
  CreateNewUserCommand,
  IUserCommandHandler,
  UserEvent,
  USER_COMMAND_TYPE,
  IUserRepository,
  IUserDomainModel,
} from "../types";
import {
  InvalidCommandError,
  NoEventsGeneratedError,
  UserNotFoundError,
} from "../utils/errors";

export class UserHandler implements IUserCommandHandler {
  userRepository: IUserRepository;
  userDomainModel: IUserDomainModel;

  constructor(
    userRepository: IUserRepository,
    userDomainModel: IUserDomainModel
  ) {
    this.userRepository = userRepository;
    this.userDomainModel = userDomainModel;
  }

  /**
   * Checks if the command provided is a valid command and if property values are missing
   * @param command
   * @param expectedCommandType
   * @returns true | false
   */
  public commandValidator(
    command: Command,
    expectedCommandType: USER_COMMAND_TYPE
  ): boolean {
    const initialCheck =
      Object.values(command).length > 0 &&
      Object.values(command).every(
        (value) => value !== null && value !== undefined
      ) &&
      new Date(command.timestamp).valueOf() &&
      command.type === expectedCommandType;

    if (!initialCheck) return false;

    // Checking if also all the properties within the data property of the command are present
    switch (expectedCommandType) {
      case USER_COMMAND_TYPE.CREATE_NEW_USER_COMMAND:
      case USER_COMMAND_TYPE.CHANGE_USER_ADDRESS_COMMAND:
        return (
          Object.values(command.data).length > 0 &&
          Object.values(command.data).every(
            (value) => value !== null && value !== undefined
          )
        );
      default:
        return true;
    }
  }

  /**
   * Handle the generation of the events related to a CREATE_NEW_USER_COMMAND.
   * @param command
   * @throws {NoEventsGeneratedError}
   * @returns
   */
  public async createNewUser(command: CreateNewUserCommand) {
    if (
      !this.commandValidator(command, USER_COMMAND_TYPE.CREATE_NEW_USER_COMMAND)
    )
      throw new InvalidCommandError();

    // Generating the events related to the command
    const events: UserEvent[] = this.userDomainModel.createNewUser(command);
    if (!events || events.length === 0) throw new NoEventsGeneratedError();

    return await this.userRepository.saveUserEvents(events);
  }

  /**
   * Handle the generation of the events related to a CHANGE_USER_ADDRESS_COMMAND.
   * Before generating and saving events this function checks if the user exists first.
   * @param command
   * @throws {UserNotFoundError | NoEventsGeneratedError}
   * @returns
   */
  public async changeUserAddress(command: ChangeUserAddressCommand) {
    if (
      !this.commandValidator(
        command,
        USER_COMMAND_TYPE.CHANGE_USER_ADDRESS_COMMAND
      )
    )
      throw new InvalidCommandError();

    // Checking if the user exists
    const user = await this.userRepository.getUserById(command.user_id);
    if (!user) throw new UserNotFoundError();

    // Generating the events related to the command
    const events: UserEvent[] = this.userDomainModel.changeUserAddress(command);
    if (!events || events.length === 0) throw new NoEventsGeneratedError();

    return await this.userRepository.saveUserEvents(events);
  }
}

export const UserCommandHandler = new UserHandler(
  UserRepository,
  UserDomainModel
);
