import { Model } from "mongoose";
import {
  AccountEvent,
  AuthorizedUser,
  TransactionEvent,
  UserEvent,
} from "./types";
import userEventsSeed from "./database/seeds/user_events_seed.json";
import accountEventsSeed from "./database/seeds/account_events_seed.json";
import transactionEventsSeed from "./database/seeds/transaction_events_seed.json";
import authorizedUserSeed from "./database/seeds/authorized_users.json";

export const seeder = async (models: {
  userEventModel?: Model<UserEvent, {}, {}, {}>;
  accountEventModel?: Model<AccountEvent, {}, {}, {}>;
  transactionEventModel?: Model<TransactionEvent, {}, {}, {}>;
  authorizedUserEventModel?: Model<AuthorizedUser, {}, {}, {}>;
}) => {
  if (models.userEventModel) {
    await models.userEventModel.deleteMany({}).catch((e) => console.error(e));
    await models.userEventModel
      .insertMany(userEventsSeed)
      .catch((e) => console.error(e));
  }

  if (models.accountEventModel) {
    await models.accountEventModel
      .deleteMany({})
      .catch((e) => console.error(e));
    await models.accountEventModel
      .insertMany(accountEventsSeed)
      .catch((e) => console.error(e));
  }

  if (models.transactionEventModel) {
    await models.transactionEventModel
      .deleteMany({})
      .catch((e) => console.error(e));
    await models.transactionEventModel
      .insertMany(transactionEventsSeed)
      .catch((e) => console.error(e));
  }

  if (models.authorizedUserEventModel) {
    await models.authorizedUserEventModel
      .deleteMany({})
      .catch((e) => console.error(e));
    await models.authorizedUserEventModel
      .insertMany(authorizedUserSeed)
      .catch((e) => console.error(e));
  }

  console.log("Seeding complete");
};
