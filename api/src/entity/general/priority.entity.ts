import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Task } from "./task.entity";

@Entity({ name: "PRIORITIES" })
export class Priority {
  @PrimaryColumn({ name: "PRIORITYID", length: 255 })
  priorityid: string;

  @Column({ name: "PRIORITYNAME", length: 50 })
  priorityname: string;

  @CreateDateColumn({ name: "DATECREATED" })
  datecreated: Date;

  @UpdateDateColumn({ name: "DATEMODIFIED" })
  datemodified: Date;

  @OneToMany(() => Task, task => task.priority)
  tasks: Task[];
}