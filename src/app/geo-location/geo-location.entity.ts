// src/entities/geo-location.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class GeoLocation {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
