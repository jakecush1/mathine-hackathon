import { Request, Response, NextFunction } from "express";
import { TaskXTagService } from "../services/taskxtag.service";

export class TaskXTagController {
  // Reusable validation method
  static async validateNetlink(netlink: string | undefined) {
    if (!netlink) throw new Error("Not authenticated. Netlink is required.");
  }
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);

      if (!req.body.tagid || !req.body.taskid) {
        return res.status(400).json({
          message: "Both tagid and taskid are required",
        });
      }

      const taskXTag = await TaskXTagService.createTaskXTag(req.body, process.env.netID as string);
      res.status(201).json(taskXTag);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      const taskXTagId = req.params.id;
      if (!taskXTagId) {
        return res.status(400).json({ message: "TaskTag ID is required" });
      }

      await TaskXTagService.deleteTaskXTag(taskXTagId, process.env.netID as string);
      res.status(200).json({ message: "TaskXTag deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
