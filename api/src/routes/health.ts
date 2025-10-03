import express from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "~~/config/logger";

const router = express.Router();
router.get(
  "/",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.debug("Health check");
    
    res.sendStatus(StatusCodes.OK); 
    return next();
  }
);
