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

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  label: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  blockchainNetwork: string;

  @ManyToOne(() => Investor, (investor) => investor.wallets)
  @JoinColumn({ name: 'investorId' })
  investor: Investor;

  @Column()
  investorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}