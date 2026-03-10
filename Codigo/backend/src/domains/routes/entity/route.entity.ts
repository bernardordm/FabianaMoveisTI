/* eslint-disable */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsDateString, IsString } from 'class-validator';

@Entity()
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  @IsDateString()
  routeDate: Date;

  @Column({ type: 'json', nullable: true })
  waypoints: any; // Armazena os endereços de entrega como JSON

  @Column({ type: 'text', nullable: true })
  optimizedRoute: string; // Armazena a rota otimizada como URL ou JSON

  @Column({ type: 'float', nullable: true })
  totalDistance: number; // Distância total em km

  @Column({ type: 'int', nullable: true })
  totalDuration: number; // Duração total em segundos

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}