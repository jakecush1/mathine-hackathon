import { Request, Response, NextFunction } from 'express';
import { KanbanLabelService } from '../services/kanbanlabel.service';

export class KanbanLabelController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const kanbanLabel = await KanbanLabelService.createKanbanLabel(req.body);
      res.status(201).json(kanbanLabel);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const kanbanLabels = await KanbanLabelService.getAllKanbanLabels();
      res.status(200).json(kanbanLabels);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: 'Kanban Label ID required' });
      }
      const kanbanLabel = await KanbanLabelService.getKanbanLabelById(req.params.id);
      res.status(200).json(kanbanLabel);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: 'Kanban Label ID required' });
      }
      if (!req.body.kanbanlabelname?.trim()) {
        return res.status(400).json({ message: 'Kanban Label name is required' });
      }
      const updatedKanbanLabel = await KanbanLabelService.updateKanbanLabel(
        req.params.id, 
        req.body.kanbanlabelname
      );
      res.status(200).json(updatedKanbanLabel);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: 'Kanban Label ID required' });
      }
      await KanbanLabelService.deleteKanbanLabel(req.params.id);
      res.status(200).json({ message: 'Kanban Label deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}