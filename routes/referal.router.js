import express from "express";
import { PrismaClient } from "@prisma/client";
import { clerkClient, getAuth } from "@clerk/express";

const referalRouter = express.Router();
const prisma = new PrismaClient();

referalRouter.post("/create", async (req, res) => {
  try {
    const { shareCode } = req.body;
    const { userId } = getAuth(req);

    if (!userId || !shareCode) {
      return res.status(400).json({ message: "Missing userId or shareCode" });
    }

    const referrerUser = await prisma.shareCode.findUnique({
      where: { shareCode: shareCode },
      select: { userId: true },
    });

    if (!referrerUser) {
      return res
        .status(404)
        .json({ message: "Referred user (referrer) not found" });
    }

    if (referrerUser.userId === userId) {
      return res
        .status(400)
        .json({ message: "You cannot be added under your own code" });
    }

    const currentUserReferredCount = await prisma.referral.count({
      where: {
        referrerId: userId,
      },
    });

    if (currentUserReferredCount > 0) {
      return res.status(400).json({
        message:
          "You cannot join another chain as you have already started one",
      });
    }

    const referrerRoot = await prisma.referral.findFirst({
      where: {
        referredId: referrerUser.userId,
      },
      select: { rootUserId: true },
    });

    const rootUserId = referrerRoot
      ? referrerRoot.rootUserId
      : referrerUser.userId;

    const existingReferralRelation = await prisma.referral.findFirst({
      where: {
        referrerId: referrerUser.userId,
        referredId: userId,
      },
    });

    if (existingReferralRelation) {
      return res
        .status(400)
        .json({ message: "You have already been referred by this user" });
    }

    const referral = await prisma.referral.create({
      data: {
        referrerId: referrerUser.userId,
        referredId: userId,
        rootUserId: rootUserId,
      },
    });

    res
      .status(201)
      .json({ message: "Successfully registered your referral code" });
  } catch (error) {
    console.error("Error creating referral:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

referalRouter.get("/tree", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const level1 = await prisma.referral.findMany({
      where: { referrerId: userId },
    });

    const level2 = await prisma.referral.findMany({
      where: { referrerId: { in: level1.map((r) => r.referredId) } },
    });
    const level1Users = await Promise.all(
      level1.map(async (referral) => {
        const user = await clerkClient.users.getUser(referral.referredId);
        return { firstname: user.firstName };
      })
    );
    const level2Users = await Promise.all(
      level2.map(async (referral) => {
        const user = await clerkClient.users.getUser(referral.referredId);
        return { firstname: user.firstName };
      })
    );
    res.json({ level1: level1Users, level2: level2Users });
  } catch (error) {
    console.error("Error fetching referral tree:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default referalRouter;
