import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Investment } from '../investments/investment.entity';

export enum TokenStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  TERMINATED = 'terminated',
}

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  decimals: number;

  @Column('decimal', { precision: 18, scale: 8 })
  totalSupply: number;

  @Column('decimal', { precision: 18, scale: 8 })
  totalIssued: number;

  @Column({ nullable: true })
  contractAddress: string;

  @Column({
    type: 'enum',
    enum: TokenStatus,
    default: TokenStatus.DRAFT,
  })
  status: TokenStatus;

  @Column({ default: true })
  mintingEnabled: boolean;

  @Column({ default: true })
  burningEnabled: boolean;

  @Column({ default: false })
  paused: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  issuerId: string;

  @OneToMany(() => Investment, (investment) => investment.token)
  investments: Investment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}