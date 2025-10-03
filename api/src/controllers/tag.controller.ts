import { Request, Response, NextFunction } from "express";
import { TagService } from "../services/tag.service";

export class TagController {
  // Reusable validation method
  static async validateNetlink(netlink: string | undefined) {
    if (!netlink) throw new Error("Not authenticated. Netlink is required.");
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      // Validate request format
      if (!req.body.tagname?.trim()) {
        return res.status(400).json({ message: "Tagname is required" });
      }

      const tag = await TagService.createTag(
        req.body.tagname, 
        process.env.netID as string // Pass netlink directly
      );
      
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const tags = await TagService.getAllTags(process.env.netID as string);
      res.status(200).json(tags);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const tagId = req.params.id;
      if (!tagId) {
        return res.status(400).json({ message: "Tag ID required" });
      }

      const tag = await TagService.getTagById(tagId, process.env.netID as string);
      res.status(200).json(tag);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const tagId = req.params.id;
      if (!tagId) {
        return res.status(400).json({ message: "Tag ID required" });
      }
      if (!req.body.tagname?.trim()) {
        return res.status(400).json({ message: "Tagname is required" });
      }

      const updatedTag = await TagService.updateTag(
        tagId,
        req.body.tagname,
        process.env.netID as string
      );
      
      res.status(200).json(updatedTag);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const tagId = req.params.id;
      if (!tagId) {
        return res.status(400).json({ message: "Tag ID required" });
      }

      await TagService.deleteTag(tagId, process.env.netID as string);
      res.status(200).json({ message: "Tag deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}