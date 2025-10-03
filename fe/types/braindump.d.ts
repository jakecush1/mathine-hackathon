export interface IBraindump {
  braindumpid: string;
  userid?: string;
  content?: string;
  colour?: string;
  boardpositionx: number;
  boardpositiony: number;
  boardsizex: number;
  boardsizey: number;
  datecreated: Date;
  datemodified: Date;
}