import general from "../config/genDataSource";
import { KanbanLabel } from "../entity/general/kanbanlabel.entity";
import { v4 as uuidv4 } from "uuid";

export class KanbanLabelService {
  static async validateKanbanLabelData(data: Partial<KanbanLabel>) {
    if (!data.kanbanlabelname?.trim()) throw new Error("Kanban Label name is required");
  }

  static async createKanbanLabel(data: Partial<KanbanLabel>) {
    await this.validateKanbanLabelData(data);
    const kanbanRepository = general.getRepository(KanbanLabel);
    
    const newKanbanLabel = kanbanRepository.create({
      kanbanlabelid: uuidv4(),
      kanbanlabelname: data.kanbanlabelname
    });

    return await kanbanRepository.save(newKanbanLabel);
  }

  static async getAllKanbanLabels() {
    const kanbanRepository = general.getRepository(KanbanLabel);
    return await kanbanRepository.find();
  }

  static async getKanbanLabelById(id: string) {
    const kanbanRepository = general.getRepository(KanbanLabel);
    const kanbanLabel = await kanbanRepository.findOne({ 
      where: { kanbanlabelid: id },
      relations: ['tasks']
    });
    if (!kanbanLabel) throw new Error("Kanban Label not found");
    return kanbanLabel;
  }

  static async updateKanbanLabel(id: string, kanbanlabelname: string) {
    const kanbanRepository = general.getRepository(KanbanLabel);
    const kanbanLabel = await kanbanRepository.findOne({ where: { kanbanlabelid: id } });
    if (!kanbanLabel) throw new Error("Kanban Label not found");
    
    kanbanLabel.kanbanlabelname = kanbanlabelname;
    return await kanbanRepository.save(kanbanLabel);
  }

  static async deleteKanbanLabel(id: string) {
    const kanbanRepository = general.getRepository(KanbanLabel);
    const kanbanLabel = await kanbanRepository.findOne({
      where: { kanbanlabelid: id },
      relations: ['tasks']
    });
    
    if (!kanbanLabel) throw new Error("Kanban Label not found");
    if (kanbanLabel.tasks.length > 0) {
      throw new Error("Cannot delete kanban label with associated tasks");
    }
    
    await kanbanRepository.remove(kanbanLabel);
  }
}