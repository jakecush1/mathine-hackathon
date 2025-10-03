import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique, Index } from "typeorm";
import { Calendar } from './calendar.entity'

@Entity({ name: "CALENDAR_OVERRIDES" })
@Unique('UQ_CAL_OVERRIDE', ['calendarid', 'recurrenceIdLocal'])
@Index(['calendarid'])
export class CalendarOverride {
    @PrimaryGeneratedColumn({ name: "ID" })
    id: number;

    // FK to calendar entity
    @ManyToOne(() => Calendar, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'CALENDARID', referencedColumnName: 'calendarid' })
    calendar: Calendar;

    @Column({ name: 'CALENDARID', length: 255 })
    calendarid: string;

    @Column({ name: "TITLE", length: 100 })
    title: string;

    @Column({ name: 'RECURRENCE_ID_LOCAL', length: 256 })
    recurrenceIdLocal: string;

    @Column({ name: "STARTDATETIME" })
    startdatetime: Date;

    @Column({ name: "ENDDATETIME" })
    enddatetime: Date;

    @Column({ name: 'EXDATE', nullable: true })
    exdate?: string;

    @CreateDateColumn({ name: "DATECREATED" })
    datecreated: Date;

    @UpdateDateColumn({ name: "DATEMODIFIED" })
    datemodified: Date;

    @Column({ name: "LOCATION", nullable: true })
    location?: string;

    @Column({ name: "DESCRIPTION", nullable: true })
    description?: string;

    @Column({ name: 'STATUS', length: 16, nullable: true })
    status?: string; // e.g., "confirmed", "cancelled"
}