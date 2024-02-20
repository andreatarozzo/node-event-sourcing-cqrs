import { Model } from "mongoose";
import { UserEventModel } from "../database/models/user_event_db_model";
import { userReducer } from "../domain/reducers/user_reducer";
import {
  IUserRepository,
  User,
  UserEvent,
  UserReducerFunction,
} from "../types";

export class UserRepo implements IUserRepository {
  userEventModel: Model<UserEvent, {}, {}, {}>;
  userReducer: UserReducerFunction;

  constructor(
    userEventModel: Model<UserEvent, {}, {}, {}>,
    userReducer: UserReducerFunction
  ) {
    this.userEventModel = userEventModel;
    this.userReducer = userReducer;
  }

  /**
   * Get all users events
   * @returns
   */
  public async getUsersEvents(): Promise<UserEvent[] | void> {
    return await this.userEventModel.find().sort({ timestamp: 1 });
  }

  /**
   * Get all user's profile events related to the user creation and profile changes
   * @param user_id
   * @returns
   */
  public async getEventsByUserId(user_id: string): Promise<UserEvent[] | void> {
    return await this.userEventModel.find({ user_id }).sort({ timestamp: 1 });
  }

  /**
   * Get a user by user id
   * @param user_id
   * @returns
   */
  public async getUserById(user_id: string): Promise<User | void> {
    const events = await this.userEventModel
      .find({ user_id })
      .sort({ timestamp: 1 });
    return this.userReducer(events);
  }

  /**
   * Saves events to db.
   * @param user_events
   * @returns
   */
  public async saveUserEvents(
    user_events: UserEvent[]
  ): Promise<UserEvent[] | void> {
    return await this.userEventModel.insertMany(user_events);
  }
}

export const UserRepository = new UserRepo(UserEventModel, userReducer);
