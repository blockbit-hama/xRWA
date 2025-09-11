import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('stable_coins')
export class StableCoin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  symbol: string;

  @Column()
  decimals: number;

  @Column({ type: 'bigint' })
  maxSupply: string;

  @Column()
  contractAddress: string;

  @Column()
  issuerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'issuerId' })
  issuer: User;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  mintingEnabled: boolean;

  @Column({ default: true })
  burningEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}