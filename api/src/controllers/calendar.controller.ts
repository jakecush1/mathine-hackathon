import { Request, Response, NextFunction } from "express";
import { CalendarService } from "../services/calendar.service";

export class CalendarController {
  // Reusable validation method
  static async validateNetlink(netlink: string | undefined) {
    if (!netlink) throw new Error("Not authenticated. Netlink is required.");
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);  // Validate session

      const calendar = await CalendarService.createCalendar(req.body, process.env.netID as string // Inject netlink into data
      );
      
      res.status(201).json(calendar);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const calendars = await CalendarService.getAllCalendars(
        process.env.netID as string // Pass netlink directly
      );
      
      res.status(200).json(calendars);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const calendarId = req.params.id;
      if (!calendarId) {
        return res.status(400).json({ message: "Calendar ID required" });
      }

      const calendar = await CalendarService.getCalendarById(
        calendarId,
        process.env.netID as string // Pass netlink directly
      );
      
      res.status(200).json(calendar);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const calendarId = req.params.id;
      if (!calendarId) {
        return res.status(400).json({ message: "Calendar ID required" });
      }

      const updatedCalendar = await CalendarService.updateCalendar(
        calendarId,
        req.body,
        process.env.netID as string // Pass netlink directly
      );
      
      res.status(200).json(updatedCalendar);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateNetlink(process.env.netID);
      
      const calendarId = req.params.id;
      if (!calendarId) {
        return res.status(400).json({ message: "Calendar ID required" });
      }

      await CalendarService.deleteCalendar(
        calendarId,
        process.env.netID as string // Pass netlink directly
      );
      
      res.status(200).json({ message: "Calendar deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}