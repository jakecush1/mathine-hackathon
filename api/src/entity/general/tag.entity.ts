import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { TaskXTag } from "./taskxtag.entity";

@Entity({ name: "TAGS" })
export class Tag {
  @PrimaryColumn({ name: "TAGID", length: 255 })
  tagid: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'USERID' })
  user: User;

  @Column({ name: "TAGNAME", length: 50 })
  tagname: string;

  @CreateDateColumn({ name: "DATECREATED" })
  datecreated: Date;

  @UpdateDateColumn({ name: "DATEMODIFIED" })
  datemodified: Date;

  @OneToMany(() => TaskXTag, taskxtag => taskxtag.tag)
  taskxtags: TaskXTag[];
}