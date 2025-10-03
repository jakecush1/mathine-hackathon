import { Request, Response, NextFunction } from "express";
import { BraindumpService } from "../services/braindump.service";

export class BraindumpController {
  static async validateNetlink(netlink: string | undefined) {
    if (!netlink) throw new Error("Not authenticated. Netlink is required.");
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID)

      const data = req.body;

      const braindump = await BraindumpService.createBraindump(data, process.env.netID as string); // Use session usernetlink
      res.status(201).json(braindump);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      
      await this.validateNetlink(process.env.netID)

      const braindumps = await BraindumpService.getAllBraindumps(process.env.netID as string);
      res.status(200).json(braindumps);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID)

      const braindumpId = req.params.id;
      if (!braindumpId)
        return res.status(400).json({ message: "Braindump ID required" });

      const braindump = await BraindumpService.getBraindumpById(
        braindumpId,
        process.env.netID as string, // Use session usernetlink
      );
      res.status(200).json(braindump);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID)
      const braindumpId = req.params.id;
      if (!braindumpId)
        return res.status(400).json({ message: "Braindump ID required" });

      const updatedBraindump = await BraindumpService.updateBraindump(
        braindumpId,
        req.body,
        process.env.netID as string // Use session usernetlink
      );

      res.status(200).json(updatedBraindump);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID)
      
      const braindumpId = req.params.id;
      if (!braindumpId)
        return res.status(400).json({ message: "Braindump ID required" });

      await BraindumpService.deleteBraindump(braindumpId, process.env.netID as string); // Use session usernetlink
      res.status(200).json({ message: "Braindump deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
