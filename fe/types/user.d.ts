export interface IUser {
  userid: string;
  userbsid: string;
  username?: string;
  email: string;
  datecreated: Date;
  datemodified: Date;
  datedeleted?: Date;
  braindumpIds?: string[];
  calendarIds?: string[];
  imageIds?: string[];
  tagIds?: string[];
  taskIds?: string[];
}