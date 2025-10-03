import { Request, Response, NextFunction } from 'express';
import { ImageService } from '../services/image.service';

export class ImageController {
  // Reusable validation method
  static async validateNetlink(netlink: string | undefined) {
    if (!netlink) throw new Error("Not authenticated. Netlink is required.");
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const image = await ImageService.createImage(
        req.body, 
        process.env.netID as string // Pass netlink as separate parameter
      );
      res.status(201).json(image);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const images = await ImageService.getAllImages(
        process.env.netID as string // Pass netlink directly
      );
      res.status(200).json(images);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const imageId = req.params.id;
      if (!imageId) {
        return res.status(400).json({ message: 'Image ID required' });
      }
      
      const image = await ImageService.getImageById(
        imageId, 
        process.env.netID as string // Pass netlink directly
      );
      res.status(200).json(image);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const imageId = req.params.id;
      if (!imageId) {
        return res.status(400).json({ message: 'Image ID required' });
      }
      
      const updatedImage = await ImageService.updateImage(
        imageId, 
        req.body, 
        process.env.netID as string // Pass netlink directly
      );
      res.status(200).json(updatedImage);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const imageId = req.params.id;
      if (!imageId) {
        return res.status(400).json({ message: 'Image ID required' });
      }
      
      await ImageService.deleteImage(
        imageId, 
        process.env.netID as string // Pass netlink directly
      );
      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}