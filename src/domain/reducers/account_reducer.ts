import {
  Account,
  AccountEvent,
  ACCOUNT_TYPE,
  ACCOUNT_EVENT_TYPE,
} from "../../types";

/**
 * Transform the events stream into an Account Entity
 * @param accountEvents
 * @returns
 */
export const accountReducer = (
  accountEvents: AccountEvent[]
): Account | void => {
  if (!accountEvents || accountEvents.length === 0) return;

  const currentState: AccountEvent = accountEvents.reduce(
    (state: AccountEvent, event: AccountEvent) => {
      switch (event.type) {
        case ACCOUNT_EVENT_TYPE.ACCOUNT_CREATED_EVENT:
          return {
            account_id: event.account_id,
            owner_id: event.owner_id,
            branch_id: event.branch_id,
            account_type: event.account_type,
            is_active: event.is_active,
          } as AccountEvent;

        case ACCOUNT_EVENT_TYPE.ACCOUNT_TYPE_CHANGED_EVENT:
          state.account_type = event.account_type;
          return state;

        default:
          return state;
      }
    },
    {} as AccountEvent
  );

  const account: Account = {
    id: currentState.account_id,
    owner_id: currentState.owner_id,
    branch_id: currentState.branch_id,
    account_type: currentState.account_type as ACCOUNT_TYPE,
    is_active: currentState.is_active,
  };

  return account;
};
