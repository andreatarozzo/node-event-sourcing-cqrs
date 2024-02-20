import { AccountDomainModel } from "../domain/account_domain_model";
import { AccountRepository } from "../repositories/account_repository";
import { UserRepository } from "../repositories/user_repository";
import {
  CreateNewAccountCommand,
  ChangeAccountTypeCommand,
  IAccountCommandHandler,
  Command,
  ACCOUNT_COMMAND_TYPE,
  AccountEvent,
  IAccountRepository,
  IUserRepository,
  IAccountDomainModel,
} from "../types";
import {
  AccountNotFoundError,
  InvalidCommandError,
  NoEventsGeneratedError,
  UserNotFoundError,
} from "../utils/errors";

export class AccountHandler implements IAccountCommandHandler {
  accountRepository: IAccountRepository;
  userRepository: IUserRepository;
  accountDomainModel: IAccountDomainModel;

  constructor(
    accountRepository: IAccountRepository,
    userRepository: IUserRepository,
    accountDomainModel: IAccountDomainModel
  ) {
    this.accountRepository = accountRepository;
    this.userRepository = userRepository;
    this.accountDomainModel = accountDomainModel;
  }

  /**
   * Checks if the command provided is a valid command and if property values are missing
   * @param command
   * @param expectedCommandType
   * @returns true | false
   */
  public commandValidator(
    command: Command,
    expectedCommandType: ACCOUNT_COMMAND_TYPE
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
      case ACCOUNT_COMMAND_TYPE.CHANGE_ACCOUNT_TYPE_COMMAND:
      case ACCOUNT_COMMAND_TYPE.CREATE_NEW_ACCOUNT_COMMAND:
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
   * Handle the generation of the events related to a CREATE_NEW_ACCOUNT_COMMAND.
   * Checks if a user exists with the same owner_id provided in the command before generating and saving any event.
   * @param command
   * @throws {UserNotFoundError | NoEventsGeneratedError}
   * @returns AccountEvent[]
   */
  public async createNewAccount(
    command: CreateNewAccountCommand
  ): Promise<AccountEvent[] | void> {
    if (
      !this.commandValidator(
        command,
        ACCOUNT_COMMAND_TYPE.CREATE_NEW_ACCOUNT_COMMAND
      )
    )
      throw new InvalidCommandError();

    // Checking if the user exists
    const user = await this.userRepository.getUserById(command.owner_id);
    if (!user)
      throw new UserNotFoundError(
        "The user related to the owner_id provided was not found"
      );

    // Generating the events realted to the command
    const events: AccountEvent[] =
      this.accountDomainModel.createNewAccount(command);
    if (!events || events.length === 0) throw new NoEventsGeneratedError();

    return await this.accountRepository.saveAccountEvents(events);
  }

  /**
   * Handle the generation of the events related to a CHANGE_ACCOUNT_TYPE_COMMAND.
   * Checks if the account exists before generating and saving any event.
   * @param command
   * @throws {AccountNotFoundError | NoEventsGeneratedError}
   * @returns AccountEvent[]
   */
  public async changeAccountType(
    command: ChangeAccountTypeCommand
  ): Promise<AccountEvent[] | void> {
    if (
      !this.commandValidator(
        command,
        ACCOUNT_COMMAND_TYPE.CHANGE_ACCOUNT_TYPE_COMMAND
      )
    )
      throw new InvalidCommandError();

    // Checking if the account exists
    const account = await this.accountRepository.getAccountById(
      command.account_id
    );
    if (!account) throw new AccountNotFoundError();

    // Generating the events realted to the command
    const events: AccountEvent[] =
      this.accountDomainModel.changeAccountType(command);
    if (!events || events.length === 0) throw new NoEventsGeneratedError();

    return await this.accountRepository.saveAccountEvents(events);
  }
}

export const AccountCommandHandler = new AccountHandler(
  AccountRepository,
  UserRepository,
  AccountDomainModel
);
