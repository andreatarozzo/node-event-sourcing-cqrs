import app from "./app";
import DB from "./database";
import { AccountEventModel } from "./database/models/account_event_db_model";
import { AuthorizedUserEventModel } from "./database/models/authorized_users_model";
import { TransactionEventModel } from "./database/models/transaction_event_db_model";
import { UserEventModel } from "./database/models/user_event_db_model";
import { seeder } from "./seeder";

app.listen(process.env.PORT || 4000, async (): Promise<void> => {
  console.log(`Server Running on port: ${process.env.PORT || 4000}`);
  await DB.connect(
    process.env.CONNECTION_STRING || "mongodb://localhost:27000/my_db_name"
  );

  if (process.env.NODE_ENV !== "production") {
    await seeder({
      userEventModel: UserEventModel,
      accountEventModel: AccountEventModel,
      transactionEventModel: TransactionEventModel,
      authorizedUserEventModel: AuthorizedUserEventModel,
    });
  }
});
