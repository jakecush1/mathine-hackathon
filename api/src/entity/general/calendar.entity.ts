import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { Task } from "./task.entity";

@Entity({ name: "CALENDARS" })
export class Calendar {
  @PrimaryColumn({ name: "CALENDARID", length: 255 })
  calendarid: string;

  @Column({ name: "TITLE", length: 100 })
  title: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'USERID' })
  user: User;

  @Column({ name: "STARTDATETIME" })
  startdatetime: Date;

  @Column({ name: "ENDDATETIME" })
  enddatetime: Date;

  @Column({ name: 'ALLDAY', default: 0 })
  allday: boolean;

  @Column({ name: 'TZID', length: 64, nullable: true })
  tzid?: string ;

  // RFC 5545 RRULE string
  @Column({ name: 'RRULE', nullable: true })
  rrule?: string;

  @Column({ name: 'RDATE', nullable: true })
  rdate?: string;

  @Column({ name: 'EXDATE', nullable: true })
  exdate?: string;

  @CreateDateColumn({ name: "DATECREATED" })
  datecreated: Date;

  @UpdateDateColumn({ name: "DATEMODIFIED" })
  datemodified: Date;

  @Column({ name: "LOCATION", nullable: true })
  location?: string;

  @Column({ name: "DESCRIPTION", length: 4000, nullable: true })
  description?: string;

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: 'TASKID' })
  task?: Task;
}