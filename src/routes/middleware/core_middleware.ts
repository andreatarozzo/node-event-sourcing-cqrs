import { Request, Response } from "express";
import { AuthService } from "../../services/auth_service";
import { logger } from "../../utils/logger";

/**
 * At every request for Commands and Queries the Authorization header is checked.
 * If there is a valid JWT token present then the request proceed otherwise 401 is returned.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const authMiddleware = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization;

  if (!token || token.indexOf("Bearer ") === -1) {
    logger.warn(
      `Unauthorized: ${
        req.headers["x-forwarded-for"] || req.socket.remoteAddress
      }`
    );
    return res.status(401).end();
  }

  const validationResult = AuthService.validateJWT(
    token.replace(/^Bearer\s+/, "")
  );
  if (!validationResult) res.status(401).end();

  next();
};
