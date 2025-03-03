import { getAuth } from "@clerk/express";
import logger from "../utils/logger.js";
import { StatusCodes } from "http-status-codes";

const checkAuthenticationMiddleware = (req, res, next) => {
  const { sessionId, userId } = getAuth(req);

  if (!sessionId || !userId) {
    logger.warn("No session ID found in request.");
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "User not authenticated" });
  }

  logger.info(`Auth Data: ${JSON.stringify({ sessionId, userId })}`);
  next();
};

export default checkAuthenticationMiddleware;
