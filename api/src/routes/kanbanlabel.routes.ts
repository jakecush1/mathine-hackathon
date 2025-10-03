import express from "express";
import { KanbanLabelController } from "../controllers/kanbanlabel.controller";

const router = express.Router();

router.post("/", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await KanbanLabelController.create(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    await KanbanLabelController.getAll(req, res, next);
  } catch (error) {
    next(error);
  }
});

//router.get("/:id", async (req, res, next) => {
//  try {
//    await KanbanLabelController.getOne(req, res, next);
//  } catch (error) {
//    next(error);
//  }
//});

//router.put("/:id", async (req, res, next) => {
//  try {
//    await KanbanLabelController.update(req, res, next);
//  } catch (error) {
//    next(error);
//  }
//});

//router.delete("/:id", async (req, res, next) => {
//  try {
//    await KanbanLabelController.delete(req, res, next);
//  } catch (error) {
//    next(error);
//  }
//});

export default router;