import {
  User,
  UserAddressChangedEventData,
  UserEvent,
  USER_EVENT_TYPE,
} from "../../types";

/**
 * Transform the events stream into an User Entity
 * @param accountEvents
 * @returns
 */
export const userReducer = (accountEvents: UserEvent[]): User | void => {
  if (!accountEvents || accountEvents.length === 0) return;

  const currentState: UserEvent = accountEvents.reduce(
    (state: UserEvent, event: UserEvent) => {
      switch (event.type) {
        case USER_EVENT_TYPE.USER_CREATED_EVENT:
          return {
            user_id: event.user_id,
            user_name: event.user_name,
            data: event.data,
          } as UserEvent;

        case USER_EVENT_TYPE.USER_ADDRESS_CHANGED_EVENT:
          state.data.address = (
            event.data as UserAddressChangedEventData
          ).address;
          return state;

        default:
          return state;
      }
    },
    {} as UserEvent
  );

  const user: User = {
    id: currentState.user_id,
    name: currentState.user_name,
    address: currentState.data.address,
  };

  return user;
};
