import { Schema, model } from "mongoose";
import { AccountEvent } from "../../types";

const accountEventModelSchema = new Schema(
  {
    type: { type: String, required: true },
    account_id: { type: String, required: true },
    owner_id: { type: String, required: true },
    branch_id: { type: String, required: true },
    account_type: { type: String, required: true },
    is_active: { type: Boolean, required: true },
    timestamp: { type: Date, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { minimize: false, optimisticConcurrency: true }
);

export const AccountEventModel = model<AccountEvent>(
  "account_events",
  accountEventModelSchema
);
