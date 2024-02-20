import { Schema, model } from "mongoose";
import { TransactionEvent } from "../../types";

const transactionEventModelSchema = new Schema(
  {
    type: { type: String, required: true },
    transaction_id: { type: String, required: true },
    sender_id: { type: String, required: false },
    sender_account_id: { type: String, required: false },
    receiver_id: { type: String, required: true },
    receiver_account_id: { type: String, required: true },
    terminal_id: { type: String, required: true },
    branch_id: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { minimize: false, optimisticConcurrency: true }
);

export const TransactionEventModel = model<TransactionEvent>(
  "transaction_events",
  transactionEventModelSchema
);
