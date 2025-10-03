import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "BRAINDUMPS" })
export class Braindump {
  @PrimaryColumn({ name: "BRAINDUMPID", length: 255 })
  braindumpid: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'USERID' })
  user: User;

  @Column({ name: "CONTENT", length: 1500, nullable: true })
  content?: string;

  @Column({ name: "COLOUR", length: 7, nullable: true })
  colour?: string;

  @Column({ name: "BOARDPOSITIONX" })
  boardpositionx: number;

  @Column({ name: "BOARDPOSITIONY" })
  boardpositiony: number;

  @Column({ name: "BOARDSIZEX" })
  boardsizex: number;

  @Column({ name: "BOARDSIZEY" })
  boardsizey: number;

  @CreateDateColumn({ name: "DATECREATED" })
  datecreated: Date;

  @UpdateDateColumn({ name: "DATEMODIFIED" })
  datemodified: Date;
}