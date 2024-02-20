import jwt from "jsonwebtoken";
import { Model } from "mongoose";
import { AuthorizedUserEventModel } from "../database/models/authorized_users_model";
import { AuthorizedUser } from "../types";
import { UserNotAuthorized } from "../utils/errors";

class Auth {
  authorizedUserEventModel: Model<AuthorizedUser, {}, {}, {}>;

  constructor(authorizedUserEventModel: Model<AuthorizedUser, {}, {}, {}>) {
    this.authorizedUserEventModel = authorizedUserEventModel;
  }

  /**
   * Checks if the user can login by checking user name and password.
   * Returns a JWT token that needs to be passed in the Authorization header
   * @param username
   * @param password
   * @throws {UserNotAuthorized}
   * @returns
   */
  public async login(username: string, password: string): Promise<string> {
    if (!username || !password) throw new UserNotAuthorized();

    const user = await this.authorizedUserEventModel.findOne({
      username,
      password,
    });
    if (!user) throw new UserNotAuthorized();

    return jwt.sign({ username: user.username }, process.env.JWT_SECRET!, {
      expiresIn: "5000d",
    });
  }

  /**
   * Checks if the JWT token provided is valid
   * @param token
   * @returns
   */
  public validateJWT(token: string) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const AuthService = new Auth(AuthorizedUserEventModel);
