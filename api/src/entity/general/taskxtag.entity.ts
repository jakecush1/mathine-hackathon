import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Tag } from "./tag.entity";
import { Task } from "./task.entity";

@Entity({ name: "TASKXTAGS" })
export class TaskXTag {
  @PrimaryColumn({ name: "TAGXTASKID", length: 255 })
  tagxtaskid: string;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'TAGID' })
  tag: Tag;

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'TASKID' }) 
  task: Task;
}