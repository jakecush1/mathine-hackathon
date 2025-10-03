import express from "express";
import { CalendarController } from "../controllers/calendar.controller";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    await CalendarController.create(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    await CalendarController.getAll(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    await CalendarController.getOne(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await CalendarController.update(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await CalendarController.delete(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;