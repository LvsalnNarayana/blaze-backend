import { clerkClient, getAuth } from "@clerk/express";
import express from "express";
import asyncHandler from "express-async-handler";
import logger from "../utils/logger.js";
import prisma from "../utils/prismaClient.js";

const userRouter = express.Router();

userRouter.post(
  "/connect-mt5",
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    try {
      const { mt5_account_number, password, mt5_server } = req.body,
        user = await clerkClient.users.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await prisma.mt5Account.create({
        data: {
          mt5_account_number,
          password,
          mt5_server,
          userId,
        },
      });

      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          mt5_account_connected: true,
        },
      });

      logger.info(`MT5 account connected for user: ${userId}`);
      res.status(200).json({ message: "MT5 account connected successfully" });
    } catch (error) {
      logger.error("Error connecting MT5 account:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  })
);
export default userRouter;
