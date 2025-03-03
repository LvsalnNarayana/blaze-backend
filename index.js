import express from "express";
import "dotenv/config";
import cors from "cors";
import logger from "./utils/logger.js";
import helmet from "helmet";
import xss from "xss";
import { clerkMiddleware, getAuth, requireAuth } from "@clerk/express";
import { StatusCodes } from "http-status-codes";
import authRouter from "./routes/auth.router.js";
import cookieParser from "cookie-parser";
import referalRouter from "./routes/referal.router.js";
import rateLimit from "express-rate-limit";
import prisma from "./utils/prismaClient.js";
import userRouter from "./routes/user.router.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

app.use(helmet());
// app.use(xss());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3001", "https://blaze-ui-delta.vercel.app"],
    methods: ["GET", "POST"],
    // allowedHeaders: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/user", requireAuth(), userRouter);
app.use("/referral", requireAuth(), referalRouter);
// app.use("/", (req, res) => {
//   res.status(StatusCodes.OK).json({ message: "Welcome to the Clerk API" });
// });
app.use("*", (req, res) => {
  logger.warn(`Invalid route accessed: ${req.method} ${req.url}`);
  res.status(StatusCodes.NOT_FOUND).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

const shutdown = async (signal) => {
  logger.error(`Received ${signal}. Server is shutting down...`);
  try {
    await prisma.$disconnect();
    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });
  } catch (err) {
    logger.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception:", { error: err });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection:", { reason, promise });
  process.exit(1);
});

process.on("exit", (code) => {
  logger.error(`Server is shutting down with code ${code}`);
});

process.on("beforeExit", (code) => {
  logger.error(`Server is going to shut down with code ${code}`);
});
