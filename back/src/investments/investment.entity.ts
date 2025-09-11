import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Investor } from '../investors/investor.entity';
import { Token } from '../tokens/token.entity';

export enum InvestmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FUNDED = 'funded',
  ISSUED = 'issued',
  CANCELLED = 'cancelled',
}

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  investmentId: string;

  @Column('decimal', { precision: 18, scale: 8 })
  amount: number;

  @Column('decimal', { precision: 18, scale: 8 })
  tokenAmount: number;

  @Column({
    type: 'enum',
    enum: InvestmentStatus,
    default: InvestmentStatus.PENDING,
  })
  status: InvestmentStatus;

  @Column({ nullable: true })
  fundingConfirmationHash: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ nullable: true })
  lockPeriod: number; // in days

  @Column({ nullable: true })
  lockReleaseDate: Date;

  @Column({ nullable: true })
  reason: string;

  @ManyToOne(() => Investor, (investor) => investor.investments)
  @JoinColumn({ name: 'investorId' })
  investor: Investor;

  @Column()
  investorId: string;

  @ManyToOne(() => Token, (token) => token.investments)
  @JoinColumn({ name: 'tokenId' })
  token: Token;

  @Column()
  tokenId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}