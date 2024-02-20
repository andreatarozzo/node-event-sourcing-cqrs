import { transactionBalanceReducer } from "../domain/reducers/transaction_reducer";
import { TransactionDomainModel } from "../domain/transaction_domain_model";
import { AccountRepository } from "../repositories/account_repository";
import { TransactionRepository } from "../repositories/transaction_repository";
import { UserRepository } from "../repositories/user_repository";
import {
  Command,
  ITransactionCommandCommandHandler,
  TransactionEvent,
  TRANSACTION_COMMAND_TYPE,
  TransferAmountCommand,
  DepositAmountCommand,
  BalanceReducerFunction,
  IAccountRepository,
  IUserRepository,
  ITransactionDomainModel,
  ITransactionRepository,
} from "../types";
import {
  InvalidCommandError,
  NoEventsGeneratedError,
  UserNotFoundError,
  AccountNotFoundError,
  AccountBalanceBelowZero,
} from "../utils/errors";

export class TransactionHandler implements ITransactionCommandCommandHandler {
  transactionRepository: ITransactionRepository;
  accountRepository: IAccountRepository;
  userRepository: IUserRepository;
  transactionDomainModel: ITransactionDomainModel;
  balanceReducer: BalanceReducerFunction;

  constructor(
    transactionRepository: ITransactionRepository,
    accountRepository: IAccountRepository,
    userRepository: IUserRepository,
    transactionDomainModel: ITransactionDomainModel,
    balanceReducer: BalanceReducerFunction
  ) {
    this.transactionRepository = transactionRepository;
    this.accountRepository = accountRepository;
    this.userRepository = userRepository;
    this.transactionDomainModel = transactionDomainModel;
    this.balanceReducer = balanceReducer;
  }

  /**
   * Checks if the command provided is a valid command and if property values are missing
   * @param command
   * @param expectedCommandType
   * @returns true | false
   */
  public commandValidator(
    command: Command,
    expectedCommandType: TRANSACTION_COMMAND_TYPE
  ): boolean {
    const initialCheck =
      Object.values(command).length > 0 &&
      Object.values(command).every(
        (value) => value !== null && value !== undefined
      ) &&
      new Date(command.timestamp).valueOf() &&
      command.type === expectedCommandType;

    if (!initialCheck) return false;
    return true;
  }

  /**
   * Checks if sender and receiver exists alongside with their accounts.
   * If the TRANSACTION_COMMAND_TYPE is DEPOSIT_AMOUNT_COMMAND then only the receiver and receiver account are checked.
   * @param params
   * @throws {UserNotFoundError | AccountNotFoundError}
   * @returns
   */
  public async checkUsersAndAccounts(params: {
    commandType: TRANSACTION_COMMAND_TYPE;
    receiver_id: string;
    sender_id?: string;
    receiver_account_id: string;
    sender_account_id?: string;
  }): Promise<void | boolean> {
    if (!params)
      throw new TypeError("params cannot be null: checkUsersAndAccounts");

    // Checking if users exists
    const receiver = await this.userRepository.getUserById(params.receiver_id);
    if (!receiver)
      throw new UserNotFoundError(
        `The receiver "${params.receiver_id}" of the transaction does not exists`
      );

    // Checking if accounts exists
    const receiverAccount = await this.accountRepository.getAccountById(
      params.receiver_account_id
    );
    if (!receiverAccount)
      throw new AccountNotFoundError(
        `The receiver account "${params.receiver_account_id}" of the transaction does not exists`
      );

    if (
      params.commandType === TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND
    ) {
      const sender = await this.userRepository.getUserById(params.sender_id!);
      if (!sender)
        throw new UserNotFoundError(
          `The sender "${params.sender_id}" of the transaction does not exists`
        );

      const senderAccount = await this.accountRepository.getAccountById(
        params.sender_account_id!
      );
      if (!senderAccount)
        throw new AccountNotFoundError(
          `The sender account "${params.sender_account_id}" of the transaction does not exists`
        );
    }

    return true;
  }

  /**
   * Checks the balance of an account
   * @param account_id
   * @returns
   */
  public async checkAccountBalance(account_id: string): Promise<number> {
    const events = await this.transactionRepository.getEventsByAccountId(
      account_id
    );
    if (!events || events.length === 0) return 0;

    return this.balanceReducer(events, account_id);
  }

  /**
   * Handle the generation of the events related to a TRANSFER_AMOUNT_COMMAND.
   * Before generating and saving the events, this function checks if the users and accounts
   * exists and if the sender account has enough founds to proceed with the transaction.
   * @param command
   * @throws {AccountBalanceBelowZero | NoEventsGeneratedError | UserNotFoundError | AccountNotFoundError}
   * @returns
   */
  public async transferAmount(
    command: TransferAmountCommand
  ): Promise<TransactionEvent[]> {
    if (
      !this.commandValidator(
        command,
        TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND
      )
    )
      throw new InvalidCommandError(
        "The command is missing mandatory information"
      );

    // Checking if the participants in the transaction and the accounts involved exists
    await this.checkUsersAndAccounts({
      commandType: TRANSACTION_COMMAND_TYPE.TRANSFER_AMOUNT_COMMAND,
      receiver_id: command.receiver_id,
      sender_id: command.sender_id,
      receiver_account_id: command.receiver_account_id,
      sender_account_id: command.sender_account_id,
    });

    // Check if the sender account has enough balance to complete the transfer
    const balance = await this.checkAccountBalance(command.sender_account_id);
    if (balance < command.amount) throw new AccountBalanceBelowZero();

    const events: TransactionEvent[] =
      this.transactionDomainModel.transferAmount(command) as TransactionEvent[];
    if (!events || events.length === 0) throw new NoEventsGeneratedError();

    await this.transactionRepository.saveTransactionEvents(events);
    return events;
  }

  /**
   * Handle the generation of the events related to a DEPOSIT_AMOUNT_COMMAND.
   * Before generating and saving the events, this function checks if the user and account exists.
   * @param command
   * @throws {NoEventsGeneratedError | UserNotFoundError | AccountNotFoundError}
   * @returns
   */
  public async depositAmount(
    command: DepositAmountCommand
  ): Promise<TransactionEvent[]> {
    if (
      !this.commandValidator(
        command,
        TRANSACTION_COMMAND_TYPE.DEPOSIT_AMOUNT_COMMAND
      )
    )
      throw new InvalidCommandError(
        "The command is missing mandatory information"
      );

    // Checking if the participants in the transaction and the accounts involved exists
    await this.checkUsersAndAccounts({
      commandType: TRANSACTION_COMMAND_TYPE.DEPOSIT_AMOUNT_COMMAND,
      receiver_id: command.receiver_id,
      receiver_account_id: command.receiver_account_id,
    });

    const events: TransactionEvent[] =
      this.transactionDomainModel.depositAmount(command) as TransactionEvent[];
    if (!events || events.length === 0) throw new NoEventsGeneratedError();

    await this.transactionRepository.saveTransactionEvents(events);
    return events;
  }
}

export const TransactionCommandCommandHandler = new TransactionHandler(
  TransactionRepository,
  AccountRepository,
  UserRepository,
  TransactionDomainModel,
  transactionBalanceReducer
);
