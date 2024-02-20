import express from "express";
import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { AuthService } from "../../services/auth_service";

const authRoutes = express.Router();

/**
 * Perform the checks on the credentials provided and if the user exists then a JWT token is provided
 * which will need to be placed in the Authorization header to authenticate all requests for Commands and Queries.
 * @name post/login
 */
authRoutes.post("/login", async (req: Request, res: Response, next) => {
  try {
    const token = await AuthService.login(req.body.username, req.body.password);
    return res.status(200).json({ success: true, token }).end();
  } catch (e: any) {
    logger.error(e);
    const statusCode = e.statusCode ? e.statusCode : 500;
    return res.status(statusCode).json({ error: e.message }).end();
  }
});

authRoutes.post("/auth", async (req: Request, res: Response, next) => {
  try {
    const result = AuthService.validateJWT(req.body.token);
    return res.status(200).json({ success: result }).end();
  } catch (e: any) {
    logger.error(e);
    const statusCode = e.statusCode ? e.statusCode : 500;
    return res.status(statusCode).json({ error: e.message }).end();
  }
});

export default authRoutes;
