/* eslint-disable */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail } from 'class-validator';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({length: 100})
  nome: string;

  @Column({ length: 100, nullable: true })
  cargo: string;

  @Column({unique: true})
  @IsEmail()
  email: string;

  @Column({length: 255})
  password: string;

}