import type { ICalendar } from "./calendar";
import type { IKanbanLabel } from "./kanbanlabel";
import type { IPriority } from "./priority";
import type { ITaskXTag } from "./taskxtag";

export interface ITask {
  taskid: string;
  coursebsid?: string;
  coursename?: string;
  dropboxbsid?: string;
  dropboxdue?: Date;
  taskname: string;
  userid?: string;
  kanbanlabelid: string;
  priorityid: string;
  user?: IUser;
  kanbanlabel?: IKanbanLabel;
  priority?: IPriority;
  duedate?: Date;
  duration?: Date;
  colour: string;
  description?: string;
  datecreated: Date;
  datemodified: Date;
  taskxtag?: ITaskXTag[];
  calendar?: ICalendar[];
}