export interface ICalendarOverride {
    id: number;
    calendarid: string;
    title: string;
    startdatetime: Date;
    enddatetime: Date;
    datecreated: Date;
    datemodified: Date;
    location?: string;
    description?: string;
    status?: string;
}