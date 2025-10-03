import general from "../config/genDataSource";
import { UserService } from "./user.service";
import { TaskXTag } from "../entity/general/taskxtag.entity";
import { Tag } from "../entity/general/tag.entity";
import { Task } from "../entity/general/task.entity";
import { v4 as uuidv4 } from "uuid";

export class TaskXTagService {
  private static validateCreateInput(data: Partial<TaskXTag>) {
    if (!data.tag?.tagid) throw new Error("Tag ID is required");
    if (!data.task?.taskid) throw new Error("Task ID is required");
  }

  static async createTaskXTag(data: Partial<TaskXTag>, netlink: string) {
    const tagid = (data as any).tagid;
    const taskid = (data as any).taskid;

    // Get authenticated user
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const taskXTagRepository = general.getRepository(TaskXTag);
    const tagRepository = general.getRepository(Tag);
    const taskRepository = general.getRepository(Task);
    
    const tag = await tagRepository.findOne({
      where: { tagid: tagid },
      relations: ["user"], 
    });
    const task = await taskRepository.findOne({
      where: { taskid: taskid },
      relations: ["user"], 
    });
    console.log("Tag:", tag, "Task:", task);

    if (!tag || tag.user.userid != user.userid) throw new Error("Tag not found or not associated to the user");
    if (!task || task.user.userid != user.userid) throw new Error("Task not found");

    const newTaskXTag = taskXTagRepository.create({
      tagxtaskid: uuidv4(), // Matches entity's @PrimaryColumn name
      tag,
      task,
    });

    return await taskXTagRepository.save(newTaskXTag);
  }

  static async deleteTaskXTag(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const taskXTagRepository = general.getRepository(TaskXTag);
    const taskXTag = await taskXTagRepository.findOne({
      where: { tagxtaskid: id },
      relations: ["task.user", "tag.user"], 
    });

    if (taskXTag?.tag.user.userid !== user.userid && taskXTag?.task.user.userid !== user.userid) throw new Error("TaskXTag not found or not owned by user");
    return await taskXTagRepository.remove(taskXTag);
  }
}
