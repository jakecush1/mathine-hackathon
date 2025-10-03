import type { IUser } from "./user";

export interface ITag {
  tagid: string;
  userid?: string;
  tagname: string;
  datecreated: Date;
  datemodified: Date;
  user?: IUser;
}