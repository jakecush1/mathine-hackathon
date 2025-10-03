import express from "express";
import { TagController } from "../controllers/tag.controller";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    await TagController.create(req, res, next);
  } catch (error) {
    next(error);
  }
});
router.get("/", async (req, res, next) => {
  try {
    await TagController.getAll(req, res, next);
  } catch (error) {
    next(error);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    await TagController.getOne(req, res, next);
  } catch (error) {
    next(error);
  }
});
router.put("/:id", async (req, res, next) => {
  try {
    await TagController.update(req, res, next);
  } catch (error) {
    next(error);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    await TagController.delete(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
