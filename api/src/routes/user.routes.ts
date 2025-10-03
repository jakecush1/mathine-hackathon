import express from "express";
import { UserController } from "../controllers/user.controller";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    await UserController.create(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    await UserController.getAll(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    await UserController.getOne(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await UserController.update(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await UserController.delete(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;