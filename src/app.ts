import express, { Application } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import expressWinston from "express-winston";
import { loggerSettings } from "./utils/logger";
import userCommandRoutes from "./routes/commands/user_command_routes";
import accountCommandRoutes from "./routes/commands/account_command_routes";
import TransferAmountCommandRoutes from "./routes/commands/transaction_command_routes";
import userQueryRoutes from "./routes/queries/user_query_routes";
import accountQueryRoutes from "./routes/queries/account_query_routes";
import transactionQueryRoutes from "./routes/queries/transaction_query_routes";
import { commandLoggerMiddleware } from "./routes/middleware/command_middleware";
import { queryLoggerMiddleware } from "./routes/middleware/query_middleware";
import { authMiddleware } from "./routes/middleware/core_middleware";
import authRoutes from "./routes/core/auth_route";
import cors from "cors";

dotenv.config();
const app: Application = express();

app.use(expressWinston.logger(loggerSettings));
app.use(helmet());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors({ credentials: true, origin: "*" }));

// Auth Routes
app.use("/auth/v1", authRoutes);

// Auth Middlewares
app.use("/command/", authMiddleware);
app.use("/query/", authMiddleware);

// Command Routes
app.use("/command/", commandLoggerMiddleware);
app.use("/command/user/v1", userCommandRoutes);
app.use("/command/account/v1", accountCommandRoutes);
app.use("/command/transaction/v1", TransferAmountCommandRoutes);

// Query Routes
app.use("/query/", queryLoggerMiddleware);
app.use("/query/user/v1", userQueryRoutes);
app.use("/query/account/v1", accountQueryRoutes);
app.use("/query/transaction/v1", transactionQueryRoutes);

export default app;
