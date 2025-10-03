export interface IImage {
  imageid: string;
  imageurl: string;
  imagecategory: string;
  progress: number;
  userid: string;
  revealeddate?: Date;
  datecreated: Date;
  datemodified: Date;
}