import general from "../config/genDataSource";
import { Calendar } from "../entity/general/calendar.entity";
import { UserService } from "./user.service";
import { Task } from "../entity/general/task.entity";
import { v4 as uuidv4 } from "uuid";

export class CalendarService {
  static async createCalendar(data: Partial<Calendar>, netlink: string) {
    console.log("Creating calendar with data:", data);
    // Validation
    if (!data.title) throw new Error("Title is required");
    if (!data.startdatetime) throw new Error("Start datetime is required");
    if (!data.enddatetime) throw new Error("End datetime is required");

    const calendarRepository = general.getRepository(Calendar);
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const taskid = (data as any).taskid;
    // Handle task association
    let task: Task | null = null;
    if (taskid) {
      const taskRepository = general.getRepository(Task);
      task = await taskRepository.findOne({ 
        where: { taskid: taskid },
        relations: ["user"]
      });
      
      // Verify task exists and belongs to user
      if (!task || task.user?.userid !== user.userid) {
        throw new Error("Task not found or not owned by user");
      }
    }
    const preparedData = {
      ...data,
      userid: user.userid,
      taskid: task?.taskid
    };
    const newCalendar = calendarRepository.create({
      calendarid: uuidv4(),
      ...data,
      user,
      task: task || undefined, // Set task if exists
    });

    return await calendarRepository.save(newCalendar);
  }

  static async getAllCalendars(netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const calendarRepository = general.getRepository(Calendar);
    return await calendarRepository.find({
      where: { user: { userid: user.userid } },
      relations: ["user", "task"],
    });
  }

  static async getCalendarById(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const calendarRepository = general.getRepository(Calendar);
    const calendar = await calendarRepository.findOne({
      where: { calendarid: id, user: { userid: user.userid } },
      relations: ["user", "task"],
    });

    if (!calendar) throw new Error("Calendar not found or not owned by user");
    return calendar;
  }

  static async updateCalendar(
    id: string,
    data: Partial<Calendar>,
    netlink: string
  ) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const calendarRepository = general.getRepository(Calendar);
    const calendar = await calendarRepository.findOne({
      where: { calendarid: id, user: { userid: user.userid } },
      relations: ["user", "task"],
    });

    if (!calendar) throw new Error("Calendar not found or not owned by user");

    const taskid = (data as any).taskid;
    // Handle task update
    if (taskid !== undefined) {
      if (taskid) {
        const taskRepository = general.getRepository(Task);
        const task = await taskRepository.findOne({ 
          where: { taskid: taskid },
          relations: ["user"]
        });
        
        if (!task || task.user?.userid !== user.userid) {
          throw new Error("Task not found or not owned by user");
        }
        calendar.task = task;
      } else {
        calendar.task = undefined; // Unset task
      }
    }

    // Update other fields
    const fields = [
      "startdatetime",
      "enddatetime",
      "repeatitiondwm",
      "repitionuntill",
      "repitioneverymonthday",
      "repitioneverymonthweekday",
      "repitioneverymonthithweekfstol",
      "repitionends",
      "location",
      "description",
      "title"
    ];

    fields.forEach(field => {
      if (data[field as keyof Calendar] !== undefined) {
        (calendar as any)[field] = data[field as keyof Calendar];
      }
    });

    return await calendarRepository.save(calendar);
  }

  static async deleteCalendar(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const calendarRepository = general.getRepository(Calendar);
    const calendar = await calendarRepository.findOne({
      where: { calendarid: id, user: { userid: user.userid } },
    });

    if (!calendar) throw new Error("Calendar not found or not owned by user");
    await calendarRepository.remove(calendar);
  }
}