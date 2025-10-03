import general from "../config/genDataSource";
import { Task } from "../entity/general/task.entity";
import { UserService } from "./user.service";
import { KanbanLabel } from "../entity/general/kanbanlabel.entity";
import { Priority } from "../entity/general/priority.entity";
import { v4 as uuidv4 } from "uuid";
import { TaskXTag } from "../entity/general/taskxtag.entity";
import { Calendar } from "../entity/general/calendar.entity";

export class TaskService {
  static async createTask(data: Partial<Task>, netlink: string) {
    const taskRepository = general.getRepository(Task);
    const kanbanRepository = general.getRepository(KanbanLabel);
    const priorityRepository = general.getRepository(Priority);

    // Get authenticated user
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    // Extract IDs from payload
    const kanbanLabelId = (data as any).kanbanlabelid;
    const priorityId = (data as any).priorityid;

    // Fetch related entities
    const [kanbanLabel, priority] = await Promise.all([
      kanbanLabelId
        ? kanbanRepository.findOne({ where: { kanbanlabelid: kanbanLabelId } })
        : Promise.resolve(null),
      priorityId
        ? priorityRepository.findOne({ where: { priorityid: priorityId } })
        : Promise.resolve(null),
    ]);

    // Validate required fields
    if (!data.taskname?.trim()) throw new Error("Task name is required");
    if (!kanbanLabel) throw new Error("Kanban Label not found");
    if (!priority) throw new Error("Priority not found");
    if (!data.colour?.trim()) throw new Error("Colour is required");

    // Remove flat IDs to prevent conflicts
    const { userid, kanbanlabelid, priorityid, ...cleanData } = data as any;

    const newTask = taskRepository.create({
      ...cleanData,
      taskid: uuidv4(),
      user, // Assign authenticated user
      kanbanlabel: kanbanLabel,
      priority: priority,
    });

    return await taskRepository.save(newTask);
  }

  static async getAllTasks(netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const taskRepository = general.getRepository(Task);
    return await taskRepository.find({
      where: { user: { userid: user.userid } },
      relations: ["user", "kanbanlabel", "priority", "taskxtag.tag", "calendar"],
    });
  }

  static async getTaskById(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const taskRepository = general.getRepository(Task);
    const task = await taskRepository.findOne({
      where: { taskid: id, user: { userid: user.userid } },
      relations: ["user", "kanbanlabel", "priority", "taskxtag", "calendar"],
    });
    
    if (!task) throw new Error("Task not found or not owned by user");
    return task;
  }

  static async checkUserDropboxBSId(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const taskRepository = general.getRepository(Task);
    const task = await taskRepository.findOne({
      where: { dropboxbsid: id, user: { userid: user.userid } },
    });
    
    if (!task) {
      return "User has not imported this course to Task";
    }
    else {
      throw new Error("Task found with this course BS ID for the user");
    }
  }

  static async updateTask(id: string, data: Partial<Task>, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const taskRepository = general.getRepository(Task);
    const kanbanRepository = general.getRepository(KanbanLabel);
    const priorityRepository = general.getRepository(Priority);
    
    // Get task with ownership verification
    const task = await taskRepository.findOne({ 
      where: { taskid: id, user: { userid: user.userid } },
      relations: ["user", "kanbanlabel", "priority"]
    });
    
    if (!task) throw new Error("Task not found or not owned by user");

    // Update relationships - only if they exist
    if ((data as any).kanbanlabelid) {
      const kanbanLabel = await kanbanRepository.findOne({ 
        where: { kanbanlabelid: (data as any).kanbanlabelid } 
      });
      
      if (kanbanLabel) task.kanbanlabel = kanbanLabel;
    }
    
    if ((data as any).priorityid) {
      const priority = await priorityRepository.findOne({ 
        where: { priorityid: (data as any).priorityid } 
      });
      
      if (priority) task.priority = priority;
    }

    // Update scalar fields
    if (data.taskname) task.taskname = data.taskname;
    if (data.colour) task.colour = data.colour;
    if (data.description) task.description = data.description;
    if (data.duedate) task.duedate = data.duedate;
    if (data.duration) task.duration = data.duration;
    if (data.coursebsid) task.coursebsid = data.coursebsid;
    if (data.coursename) task.coursename = data.coursename;
    if (data.dropboxbsid) task.dropboxbsid = data.dropboxbsid;

    return await taskRepository.save(task);
  }

  static async deleteTask(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const taskRepository = general.getRepository(Task);
    const calendarRepository = general.getRepository(Calendar);
    const taskXTagRepository = general.getRepository(TaskXTag);
    const task = await taskRepository.findOne({
      where: { taskid: id, user: { userid: user.userid } },
      relations: ["taskxtag", "calendar"],
    });

    if (!task) throw new Error("Task not found or not owned by user");
    
    // Delete all associated bridge entities (taskxtags)
    if (task.taskxtag && task.taskxtag.length > 0) {
      await taskXTagRepository.remove(task.taskxtag);
    }
    // Delete all associated calendar entries
    if (task.calendar && task.calendar.length > 0) {
      await calendarRepository.remove(task.calendar);
    }

    // Now delete the task
    await taskRepository.remove(task);
  }
}