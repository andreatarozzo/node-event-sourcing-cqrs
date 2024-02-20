import express from "express";
import { Request, Response } from "express";
import { UserCommandHandler } from "../../command_handlers/user_command_handler";
import { logger } from "../../utils/logger";

const userCommandRoute = express.Router();

/**
 * Handle the main logic related to generating a transaction event as result of a Create New User Command.
 * @name post/create-new-user
 */
userCommandRoute.post(
  "/create-new-user",
  async (req: Request, res: Response, next) => {
    try {
      const events = await UserCommandHandler.createNewUser(req.body);
      return res.status(200).json({
        success: true,
        events_saved: events,
      });
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

/**
 * Handle the main logic related to generating a transaction event as result of a Change User Address Command.
 * @name post/change-user-address
 */
userCommandRoute.post(
  "/change-user-address",
  async (req: Request, res: Response, next) => {
    try {
      const events = await UserCommandHandler.changeUserAddress(req.body);
      return res.status(200).json({
        success: true,
        events_saved: events,
      });
    } catch (e: any) {
      logger.error(e);
      const statusCode = e.statusCode ? e.statusCode : 500;
      return res.status(statusCode).json({ error: e.message }).end();
    }
  }
);

export default userCommandRoute;
