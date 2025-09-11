import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StableCoin } from './stable-coin.entity';
import { CreateStableCoinDto } from './dto/create-stable-coin.dto';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class StableCoinsService {
  constructor(
    @InjectRepository(StableCoin)
    private stableCoinRepository: Repository<StableCoin>,
    private blockchainService: BlockchainService,
  ) {}

  async create(createStableCoinDto: CreateStableCoinDto, issuerId: string): Promise<StableCoin> {
    const stableCoin = this.stableCoinRepository.create({
      ...createStableCoinDto,
      issuerId,
    });

    return this.stableCoinRepository.save(stableCoin);
  }

  async findAll(): Promise<StableCoin[]> {
    return this.stableCoinRepository.find();
  }

  async findByIssuer(issuerId: string): Promise<StableCoin[]> {
    return this.stableCoinRepository.find({
      where: { issuerId },
    });
  }

  async findOne(id: string): Promise<StableCoin> {
    const stableCoin = await this.stableCoinRepository.findOne({
      where: { id },
    });

    if (!stableCoin) {
      throw new NotFoundException('Stable coin not found');
    }

    return stableCoin;
  }

  async update(id: string, updateStableCoinDto: any): Promise<StableCoin> {
    const stableCoin = await this.findOne(id);
    
    Object.assign(stableCoin, updateStableCoinDto);
    return this.stableCoinRepository.save(stableCoin);
  }

  async remove(id: string): Promise<void> {
    const stableCoin = await this.findOne(id);
    await this.stableCoinRepository.remove(stableCoin);
  }

  async mint(id: string, to: string, amount: string, issuerId: string): Promise<any> {
    const stableCoin = await this.findOne(id);
    
    if (stableCoin.issuerId !== issuerId) {
      throw new ForbiddenException('Only the issuer can mint tokens');
    }

    if (!stableCoin.mintingEnabled) {
      throw new ForbiddenException('Minting is disabled for this token');
    }

    // Call blockchain service to mint tokens
    const transactionHash = await this.blockchainService.mintTokens(
      stableCoin.contractAddress,
      to,
      amount,
    );

    // Update total supply
    stableCoin.totalSupply += BigInt(amount);
    await this.stableCoinRepository.save(stableCoin);

    return {
      transactionHash,
      newTotalSupply: stableCoin.totalSupply.toString(),
    };
  }

  async burn(id: string, amount: string, issuerId: string): Promise<any> {
    const stableCoin = await this.findOne(id);
    
    if (stableCoin.issuerId !== issuerId) {
      throw new ForbiddenException('Only the issuer can burn tokens');
    }

    if (!stableCoin.burningEnabled) {
      throw new ForbiddenException('Burning is disabled for this token');
    }

    // Call blockchain service to burn tokens
    const transactionHash = await this.blockchainService.burnTokens(
      stableCoin.contractAddress,
      amount,
    );

    // Update total supply
    stableCoin.totalSupply -= BigInt(amount);
    await this.stableCoinRepository.save(stableCoin);

    return {
      transactionHash,
      newTotalSupply: stableCoin.totalSupply.toString(),
    };
  }

  async toggleMinting(id: string, issuerId: string): Promise<StableCoin> {
    const stableCoin = await this.findOne(id);
    
    if (stableCoin.issuerId !== issuerId) {
      throw new ForbiddenException('Only the issuer can toggle minting');
    }

    stableCoin.mintingEnabled = !stableCoin.mintingEnabled;
    return this.stableCoinRepository.save(stableCoin);
  }

  async toggleBurning(id: string, issuerId: string): Promise<StableCoin> {
    const stableCoin = await this.findOne(id);
    
    if (stableCoin.issuerId !== issuerId) {
      throw new ForbiddenException('Only the issuer can toggle burning');
    }

    stableCoin.burningEnabled = !stableCoin.burningEnabled;
    return this.stableCoinRepository.save(stableCoin);
  }
}