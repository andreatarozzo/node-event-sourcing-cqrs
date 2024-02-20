import { Schema, model } from "mongoose";
import { UserEvent } from "../../types";

const userEventModelSchema = new Schema(
  {
    type: { type: String, required: true },
    user_id: { type: String, required: true },
    user_name: { type: String, required: true },
    timestamp: { type: Date, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { minimize: false, optimisticConcurrency: true }
);

export const UserEventModel = model<UserEvent>(
  "user_events",
  userEventModelSchema
);
