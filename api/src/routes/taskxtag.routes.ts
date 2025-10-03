import express from "express";
import { TaskXTagController } from "../controllers/taskxtag.controller";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    await TaskXTagController.create(req, res, next);
  } catch (error) {
    next(error);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    await TaskXTagController.delete(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;