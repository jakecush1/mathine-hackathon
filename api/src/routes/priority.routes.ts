import express from "express";
import { PriorityController } from "../controllers/priority.controller";

const router = express.Router();

//router.post("/", async (req, res, next) => {
//  try {
//    await PriorityController.create(req, res, next);
//  } catch (error) {
//    next(error);
//  }
//});

router.get("/", async (req, res, next) => {
  try {
    await PriorityController.getAll(req, res, next);
  } catch (error) {
    next(error);
  }
});

//router.get("/:id", async (req, res, next) => {
//  try {
//    await PriorityController.getOne(req, res, next);
//  } catch (error) {
//    next(error);
//  }
//});

//router.put("/:id", async (req, res, next) => {
//  try {
//    await PriorityController.update(req, res, next);
//  } catch (error) {
//    next(error);
//  }
//});

//router.delete("/:id", async (req, res, next) => {
//  try {
//    await PriorityController.delete(req, res, next);
//  } catch (error) {
//    next(error);
//  }
//});

export default router;