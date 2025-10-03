import general from "../config/genDataSource";
import { Priority } from "../entity/general/priority.entity";
import { v4 as uuidv4 } from "uuid";

export class PriorityService {
  static async validatePriorityData(data: Partial<Priority>) {
    if (!data.priorityname?.trim()) throw new Error("Priority name is required");
  }

  static async createPriority(data: Partial<Priority>) {
    await this.validatePriorityData(data);

    const priorityRepository = general.getRepository(Priority);
    
    const newPriority = priorityRepository.create({
      priorityid: uuidv4(),
      priorityname: data.priorityname
    });

    return await priorityRepository.save(newPriority);
  }

  static async getAllPriorities() {
    const priorityRepository = general.getRepository(Priority);
    return await priorityRepository.find();
  }

  static async getPriorityById(id: string) {
    const priorityRepository = general.getRepository(Priority);
    const priority = await priorityRepository.findOne({ 
      where: { priorityid: id },
      relations: ['tasks']
    });
    if (!priority) throw new Error("Priority not found");
    return priority;
  }

  static async updatePriority(id: string, priorityname: string) {
    const priorityRepository = general.getRepository(Priority);
    const priority = await priorityRepository.findOne({ where: { priorityid: id } });
    if (!priority) throw new Error("Priority not found");
    
    priority.priorityname = priorityname;
    return await priorityRepository.save(priority);
  }

  static async deletePriority(id: string) {
    const priorityRepository = general.getRepository(Priority);
    const priority = await priorityRepository.findOne({
      where: { priorityid: id },
      relations: ['tasks']
    });
    
    if (!priority) throw new Error("Priority not found");
    if (priority.tasks.length > 0) {
      throw new Error("Cannot delete priority with associated tasks");
    }
    
    await priorityRepository.remove(priority);
  }
}