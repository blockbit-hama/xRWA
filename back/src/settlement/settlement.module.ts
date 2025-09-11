import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettlementService } from './settlement.service';
import { SettlementController } from './settlement.controller';
import { Investment } from '../investments/investment.entity';
import { Investor } from '../investors/investor.entity';
import { Token } from '../tokens/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Investment, Investor, Token])],
  controllers: [SettlementController],
  providers: [SettlementService],
  exports: [SettlementService],
})
export class SettlementModule {}