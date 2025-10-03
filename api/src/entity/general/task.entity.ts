import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { KanbanLabel } from "./kanbanlabel.entity";
import { Priority } from "./priority.entity";
import { TaskXTag } from "./taskxtag.entity";
import { Calendar } from "./calendar.entity";

@Entity({ name: "TASKS" })
export class Task {
  @PrimaryColumn({ name: "TASKID", length: 255 })
  taskid: string;

  @Column({ name: "COURSEBSID", length: 255, nullable: true })
  coursebsid?: string;

  @Column({ name: "COURSENAME", length: 255, nullable: true })
  coursename?: string;

  @Column({ name: "DROPBOXBSID", length: 255, nullable: true })
  dropboxbsid?: string;

  @Column({ name: "DROPBOXDUE", nullable: true })
  dropboxdue?: Date;

  @Column({ name: "TASKNAME", length: 100 })
  taskname: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'USERID' })
  user: User;

  @ManyToOne(() => KanbanLabel)
  @JoinColumn({ name: 'KANBANLABELID' })
  kanbanlabel: KanbanLabel;

  @ManyToOne(() => Priority)
  @JoinColumn({ name: 'PRIORITYID' })
  priority: Priority;

  @Column({ name: "DUEDATE", nullable: true })
  duedate?: Date;

  @Column({ name: "DURATION", nullable: true })
  duration?: Date;

  @Column({ name: "COLOUR", length: 10 })
  colour: string;

  @Column({ name: "DESCRIPTION", length: 1000, nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'DATECREATED' })
  datecreated: Date;

  @UpdateDateColumn({ name: 'DATEMODIFIED' })
  datemodified: Date;

  @OneToMany(() => TaskXTag, taskxtag => taskxtag.task)
  taskxtag: TaskXTag[];

  @OneToMany(() => Calendar, calendar => calendar.task)
  calendar: Calendar[];
}