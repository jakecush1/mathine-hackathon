import express from "express";
import { TaskController } from "../controllers/task.controller";

const router = express.Router();


router.post("/", async (req, res, next) => {
  try {
    await TaskController.create(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    await TaskController.getAll(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    await TaskController.getOne(req, res, next);
  } catch (error) {
    next(error);
  }
});
router.get("/checkBS/:id", async (req, res, next) => {
  try {
    await TaskController.checkBS(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await TaskController.update(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await TaskController.delete(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;