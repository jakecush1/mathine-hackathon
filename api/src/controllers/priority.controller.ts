import { Request, Response, NextFunction } from 'express';
import { PriorityService } from '../services/priority.service';

export class PriorityController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const priority = await PriorityService.createPriority(req.body);
      res.status(201).json(priority);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const priorities = await PriorityService.getAllPriorities();
      res.status(200).json(priorities);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: 'Priority ID required' });
      }
      const priority = await PriorityService.getPriorityById(req.params.id);
      res.status(200).json(priority);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: 'Priority ID required' });
      }
      if (!req.body.priorityname?.trim()) {
        return res.status(400).json({ message: 'Priority name is required' });
      }
      const updatedPriority = await PriorityService.updatePriority(req.params.id, req.body.priorityname);
      res.status(200).json(updatedPriority);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: 'Priority ID required' });
      }
      await PriorityService.deletePriority(req.params.id);
      res.status(200).json({ message: 'Priority deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}