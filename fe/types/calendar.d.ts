import type { ITask } from "./task";

export interface ICalendar {
  calendarid: string;
  title: string;
  userid?: string;
  startdatetime: Date;
  enddatetime: Date;
  allday: boolean;
  tzid?: string;
  rrule?: string;
  rdate?: string;
  exdate?: string;
  datecreated: Date;
  datemodified: Date;
  location?: string;
  description?: string;
  taskid?: string;
  task?: ITask;
  user?: IUser;
}