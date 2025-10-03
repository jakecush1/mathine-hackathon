import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
  // Reusable validation method
  static async validateNetlink(netlink: string | undefined) {
    if (!netlink) throw new Error("Not authenticated. Netlink is required.");
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const task = await TaskService.createTask(
        req.body, 
        process.env.netID as string  // Pass netlink as separate parameter (asserted as string)
      );
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const tasks = await TaskService.getAllTasks(process.env.netID as string);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const taskId = req.params.id;
      if (!taskId) {
        return res.status(400).json({ message: 'Task ID required' });
      }
      
      const task = await TaskService.getTaskById(
        taskId, 
        process.env.netID as string // Pass netlink directly
      );
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }
  static async checkBS(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const dropboxBSId = req.params.id;
      if (!dropboxBSId) {
        return res.status(400).json({ message: 'BS ID required' });
      }
      
      const task = await TaskService.checkUserDropboxBSId(
        dropboxBSId, 
        process.env.netID as string  // Pass netlink directly
      );
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const taskId = req.params.id;
      if (!taskId) {
        return res.status(400).json({ message: 'Task ID required' });
      }
      
      const updatedTask = await TaskService.updateTask(
        taskId, 
        req.body, 
        process.env.netID as string // Pass netlink directly
      );
      res.status(200).json(updatedTask);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const taskId = req.params.id;
      if (!taskId) {
        return res.status(400).json({ message: 'Task ID required' });
      }
      
      await TaskService.deleteTask(
        taskId, 
        process.env.netID as string // Pass netlink directly
      );
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}