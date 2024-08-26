import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../auth/auth.entity';

@Entity()
export class Notifikasi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({default: ''})
  message: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  user: User;
}
