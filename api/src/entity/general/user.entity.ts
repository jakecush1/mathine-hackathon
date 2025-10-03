import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Braindump } from "./braindump.entity";
import { Calendar } from "./calendar.entity";
import { Image } from "./image.entity";
import { Tag } from "./tag.entity";
import { Task } from "./task.entity";

@Entity({ name: "USERS" })
export class User {
  @PrimaryColumn({ name: "USERID", length: 255 })
  userid: string;

  @Column({ name: "USERBSID", length: 255 })
  userbsid: string;

  @Column({ name: "USERNAME", length: 100, nullable: true })
  username?: string;

  @Column({ name: "EMAIL", length: 255 })
  email: string;

  @CreateDateColumn({ name: "DATECREATED" })
  datecreated: Date;

  @UpdateDateColumn({ name: "DATEMODIFIED" })
  datemodified: Date;

  @Column({ name: "DATEDELETED", nullable: true })
  datedeleted?: Date;

  // Relationships
  @OneToMany(() => Braindump, braindump => braindump.user)
  braindumps: Braindump[];

  @OneToMany(() => Calendar, calendar => calendar.user)
  calendars: Calendar[];

  @OneToMany(() => Image, image => image.user)
  images: Image[];

  @OneToMany(() => Tag, tag => tag.user)
  tags: Tag[];

  @OneToMany(() => Task, task => task.user)
  tasks: Task[];
}