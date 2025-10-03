import type { ITag } from "./tag";
import type { ITask } from "./task";

export interface ITaskXTag {
  tagxtaskid: string;
  tagid: string;      
  taskid: string;
  tag?: ITag;
  task?: ITask;  
}