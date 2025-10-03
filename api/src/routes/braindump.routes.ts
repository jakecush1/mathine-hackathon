import express from "express";
import { BraindumpController } from "../controllers/braindump.controller";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    await BraindumpController.create(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    await BraindumpController.getAll(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    await BraindumpController.getOne(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await BraindumpController.update(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await BraindumpController.delete(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;