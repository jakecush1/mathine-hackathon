import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Task } from "./task.entity";

@Entity({ name: "KANBANLABELS" })
export class KanbanLabel {
  @PrimaryColumn({ name: "KANBANLABELID", length: 255 })
  kanbanlabelid: string;

  @Column({ name: "KANBANLABELNAME", length: 50 })
  kanbanlabelname: string;

  @CreateDateColumn({ name: "DATECREATED" })
  datecreated: Date;

  @UpdateDateColumn({ name: "DATEMODIFIED" })
  datemodified: Date;

  @OneToMany(() => Task, task => task.kanbanlabel)
  tasks: Task[];
}