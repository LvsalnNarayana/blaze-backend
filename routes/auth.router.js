import { clerkClient } from "@clerk/express";
import express from "express";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import logger from "../utils/logger.js";
import prisma from "../utils/prismaClient.js";
import { check, validationResult } from "express-validator";
import transporter from "../utils/mailTransported.js";

const authRouter = express.Router();

authRouter.post(
  "/sign-up",
  [
    check("firstName").notEmpty().withMessage("First name is required"),
    check("lastName").notEmpty().withMessage("Last name is required"),
    check("emailAddress")
      .isEmail()
      .withMessage("Valid email address is required")
      .normalizeEmail(),
  ],
  asyncHandler(async (req, res) => {
    const { firstName, lastName, emailAddress, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation error",
        errors: errors.array(),
      });
    }

    try {
      const generateShareCode = () =>
        firstName.toUpperCase().slice(0, 3) +
        lastName.toUpperCase().slice(0, 3) +
        crypto.randomBytes(2).toString("hex").toUpperCase();

      const shareCode = generateShareCode();

      const user = await clerkClient.users.createUser({
        firstName,
        lastName,
        emailAddress,
        password,
        publicMetadata: { shareCode, mt5_account_connected: false },
      });

      console.log(user);

      logger.info(`User created in Clerk: ${user.id}`);

      try {
        const shareCodeEntry = await prisma.shareCode.create({
          data: {
            shareCode: shareCode,
            userId: user.id,
          },
        });
        const mailOptions = {
          from: "example@domain.com", // Sender's email
          to: user?.emailAddresses[0].emailAddress, // Recipient's email
          subject: "Test Email", // Email subject
          text: "Hello from Nodemailer and MailHog!", // Email body
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        });
        return res.status(201).json({
          message: "User created successfully",
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddress: user.primaryEmailAddress.emailAddress,
          },
          shareCode: shareCodeEntry.shareCode,
        });
      } catch (dbError) {
        await clerkClient.users.deleteUser(user.id);
        logger.error("Database error during sign-up:", dbError);
        return res.status(500).json({
          message: "Error creating Sharecode",
          error: "Failed to save share code in database",
        });
      }
    } catch (error) {
      logger.error("Error during sign-up:", error);
      return res.status(500).json({
        message: "Error creating Clerk user",
        error: error.message || "Internal Server Error",
      });
    }
  })
);

export default authRouter;
