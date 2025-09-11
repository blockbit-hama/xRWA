import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StableCoinsService } from './stable-coins.service';
import { StableCoinsController } from './stable-coins.controller';
import { StableCoin } from './stable-coin.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [TypeOrmModule.forFeature([StableCoin]), BlockchainModule],
  providers: [StableCoinsService],
  controllers: [StableCoinsController],
  exports: [StableCoinsService],
})
export class StableCoinsModule {}