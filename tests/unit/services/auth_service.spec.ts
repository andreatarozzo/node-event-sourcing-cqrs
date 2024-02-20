import testDatabase from "../../test_db_setup";

import { AuthService } from "../../../src/services/auth_service";
import { AuthorizedUserEventModel } from "../../../src/database/models/authorized_users_model";
import { UserNotAuthorized } from "../../../src/utils/errors";

jest.setTimeout(600000);

// Create new db before each test
beforeAll(async () => {
  process.env.JWT_SECRET = "test";
  await testDatabase.connect();
  await testDatabase.seeder({
    authorizedUserEventModel: AuthorizedUserEventModel,
  });
});

// DB Clean Up
afterAll(async () => {
  await testDatabase.closeDatabase();
});

describe("Auth Service", () => {
  it("User Login: login", async () => {
    const token = await AuthService.login("test", "test");
    expect(token).toBeTruthy();
  });

  it("User Not Authorized Error with wrong credentials: login", async () => {
    try {
      await AuthService.login("test", "asd");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof UserNotAuthorized).toBe(true);
    }
  });

  it("User Not Authorized Error with empty credentials: login", async () => {
    try {
      await AuthService.login("", "");
      fail("No error was thrown");
    } catch (e) {
      expect(e instanceof UserNotAuthorized).toBe(true);
    }
  });

  it("Token is Valid: validateJWT", async () => {
    const token = await AuthService.login("test", "test");
    expect(token).toBeTruthy();

    const isTokenValid = AuthService.validateJWT(token);
    expect(isTokenValid).toBe(true);
  });

  it("Token not Valid: validateJWT", async () => {
    const isTokenValid = AuthService.validateJWT("asd");
    expect(isTokenValid).toBe(false);
  });
});
