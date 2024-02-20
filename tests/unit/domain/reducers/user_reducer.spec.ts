import {
  User,
  UserCreatedEventData,
  UserAddressChangedEventData,
  UserEvent,
  USER_EVENT_TYPE,
} from "../../../../src/types";
import { userReducer } from "../../../../src/domain/reducers/user_reducer";

describe("User Reducer", () => {
  const userEvents: UserEvent[] = [
    {
      type: USER_EVENT_TYPE.USER_CREATED_EVENT,
      user_id: "1",
      user_name: "Test Name",
      timestamp: new Date("2022-02-06T17:52:39.000Z"),
      data: {
        address: "Test Address",
      } as UserCreatedEventData,
    },
    {
      type: USER_EVENT_TYPE.USER_ADDRESS_CHANGED_EVENT,
      user_id: "1",
      user_name: "Test Name",
      timestamp: new Date("2022-02-07T17:52:39.000Z"),
      data: {
        address: "Test New Address",
        previous_address: "Test Address",
      } as UserAddressChangedEventData,
    },
  ];

  const userComparison: User = {
    id: "1",
    name: "Test Name",
    address: "Test New Address",
  };

  it("Can reduce the events to an Account Object", () => {
    const user = userReducer(userEvents);

    expect(user).toBeTruthy();
    expect(user as User).toMatchObject(userComparison);
  });
});
