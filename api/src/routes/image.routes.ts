import express from "express";
import { ImageController } from "../controllers/image.controller";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    await ImageController.create(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    await ImageController.getAll(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    await ImageController.getOne(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await ImageController.update(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await ImageController.delete(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;