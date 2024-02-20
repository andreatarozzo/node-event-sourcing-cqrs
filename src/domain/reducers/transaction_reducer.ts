import { TransactionEvent } from "../../types";

/**
 * Generate the current Account balance from the transactions history of an account.
 * @param transactionEvents
 * @param account_id
 * @returns
 */
export const transactionBalanceReducer = (
  transactionEvents: TransactionEvent[],
  account_id: string
): number => {
  if (!transactionEvents || transactionEvents.length === 0) return 0;

  let balance = 0;

  transactionEvents.forEach((transactionEvent: any) => {
    if (transactionEvent.receiver_account_id === account_id)
      balance += transactionEvent.amount;
    if (transactionEvent.sender_account_id === account_id)
      balance -= transactionEvent.amount;
  });

  return balance;
};
