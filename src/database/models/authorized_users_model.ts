import { Schema, model } from "mongoose";
import { AuthorizedUser as AuthorizedUser } from "../../types";

const authorizedUserModelSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { minimize: false, optimisticConcurrency: true }
);

export const AuthorizedUserEventModel = model<AuthorizedUser>(
  "authorized_users",
  authorizedUserModelSchema
);
