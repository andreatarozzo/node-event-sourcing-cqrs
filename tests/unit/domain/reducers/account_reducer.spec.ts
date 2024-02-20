import {
  Account,
  AccountCreatedEventData,
  AccountEvent,
  AccountTypeChangedEventData,
  ACCOUNT_EVENT_TYPE,
  ACCOUNT_TYPE,
} from "../../../../src/types";
import { accountReducer } from "../../../../src/domain/reducers/account_reducer";

describe("Account Reducer", () => {
  const accountEvents: AccountEvent[] = [
    {
      type: ACCOUNT_EVENT_TYPE.ACCOUNT_CREATED_EVENT,
      account_id: "10",
      owner_id: "12",
      branch_id: "11",
      is_active: true,
      account_type: ACCOUNT_TYPE.PRIVATE,
      timestamp: new Date("2022-02-06T17:52:39.000Z"),
      data: {} as AccountCreatedEventData,
    },
    {
      type: ACCOUNT_EVENT_TYPE.ACCOUNT_TYPE_CHANGED_EVENT,
      account_id: "10",
      owner_id: "12",
      branch_id: "11",
      is_active: true,
      account_type: ACCOUNT_TYPE.COMMERCIAL,
      timestamp: new Date("2022-02-07T17:52:39.000Z"),
      data: {
        previous_account_type: ACCOUNT_TYPE.PRIVATE,
      } as AccountTypeChangedEventData,
    },
  ];

  const accountComparison: Account = {
    id: "10",
    owner_id: "12",
    account_type: ACCOUNT_TYPE.COMMERCIAL,
    branch_id: "11",
    is_active: true,
  };

  it("Can reduce the events to an Account Object", () => {
    const account = accountReducer(accountEvents);

    expect(account).toBeTruthy();
    expect(account as Account).toMatchObject(accountComparison);
  });
});
