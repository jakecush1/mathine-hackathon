import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "IMAGES" })
export class Image {
  @PrimaryColumn({ name: "IMAGEID", length: 255 })
  imageid: string;

  @Column({ name: "IMAGEURL", length: 255 })
  imageurl: string;

  @Column({ name: "IMAGECATEGORY", length: 50 })
  imagecategory: string;

  @Column({ name: "PROGRESS" })
  progress: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'USERID' })
  user: User;

  @Column({ name: "REVEALEDDATE", nullable: true })
  revealeddate?: Date;

  @CreateDateColumn({ name: "DATECREATED" })
  datecreated: Date;

  @UpdateDateColumn({ name: "DATEMODIFIED" })
  datemodified: Date;
}