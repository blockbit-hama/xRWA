import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('stable_coins')
export class StableCoin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  decimals: number;

  @Column({ type: 'bigint' })
  totalSupply: bigint;

  @Column({ nullable: true })
  contractAddress: string;

  @Column({ default: true })
  mintingEnabled: boolean;

  @Column({ default: true })
  burningEnabled: boolean;

  @Column({ nullable: true })
  issuerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}