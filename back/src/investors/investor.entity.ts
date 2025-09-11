import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Wallet } from '../wallets/wallet.entity';
import { Investment } from '../investments/investment.entity';

export enum InvestorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum InvestorType {
  INDIVIDUAL = 'individual',
  INSTITUTIONAL = 'institutional',
}

@Entity('investors')
export class Investor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  investorId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  country: string;

  @Column({
    type: 'enum',
    enum: InvestorType,
    default: InvestorType.INDIVIDUAL,
  })
  type: InvestorType;

  @Column({
    type: 'enum',
    enum: InvestorStatus,
    default: InvestorStatus.PENDING,
  })
  status: InvestorStatus;

  @Column({ default: false })
  kycVerified: boolean;

  @Column({ default: false })
  accreditedInvestor: boolean;

  @Column({ default: false })
  qualifiedInvestor: boolean;

  @Column({ default: false })
  professionalInvestor: boolean;

  @Column({ nullable: true })
  kycExpiryDate: Date;

  @Column({ nullable: true })
  kycProofHash: string;

  @Column({ nullable: true })
  collisionHash: string;

  @OneToMany(() => Wallet, (wallet) => wallet.investor)
  wallets: Wallet[];

  @OneToMany(() => Investment, (investment) => investment.investor)
  investments: Investment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}