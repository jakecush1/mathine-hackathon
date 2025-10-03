export interface IKanbanLabel {
  kanbanlabelid: string;
  kanbanlabelname: string;
  datecreated: Date;
  datemodified: Date;
  taskIds?: string[];
}