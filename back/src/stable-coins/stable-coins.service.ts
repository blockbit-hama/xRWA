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
    private stableCoinsRepository: Repository<StableCoin>,
    private blockchainService: BlockchainService,
  ) {}

  async create(createStableCoinDto: CreateStableCoinDto, issuerId: string): Promise<StableCoin> {
    // 블록체인에 스테이블코인 컨트랙트 배포
    const contractAddress = await this.blockchainService.deployStableCoin({
      name: createStableCoinDto.name,
      symbol: createStableCoinDto.symbol,
      decimals: createStableCoinDto.decimals,
      maxSupply: createStableCoinDto.maxSupply,
    });

    const stableCoin = this.stableCoinsRepository.create({
      ...createStableCoinDto,
      contractAddress,
      issuerId,
    });

    return this.stableCoinsRepository.save(stableCoin);
  }

  async findAll(): Promise<StableCoin[]> {
    return this.stableCoinsRepository.find({
      relations: ['issuer'],
    });
  }

  async findOne(id: string): Promise<StableCoin> {
    const stableCoin = await this.stableCoinsRepository.findOne({
      where: { id },
      relations: ['issuer'],
    });
    if (!stableCoin) {
      throw new NotFoundException('StableCoin not found');
    }
    return stableCoin;
  }

  async findByIssuer(issuerId: string): Promise<StableCoin[]> {
    return this.stableCoinsRepository.find({
      where: { issuerId },
      relations: ['issuer'],
    });
  }

  async mint(id: string, to: string, amount: string, issuerId: string): Promise<any> {
    const stableCoin = await this.findOne(id);
    
    if (stableCoin.issuerId !== issuerId) {
      throw new ForbiddenException('Only the issuer can mint tokens');
    }

    return this.blockchainService.mintToken(stableCoin.contractAddress, to, amount);
  }

  async burn(id: string, amount: string, userId: string): Promise<any> {
    const stableCoin = await this.findOne(id);
    
    return this.blockchainService.burnToken(stableCoin.contractAddress, userId, amount);
  }

  async toggleMinting(id: string, issuerId: string): Promise<StableCoin> {
    const stableCoin = await this.findOne(id);
    
    if (stableCoin.issuerId !== issuerId) {
      throw new ForbiddenException('Only the issuer can toggle minting');
    }

    const newMintingStatus = !stableCoin.mintingEnabled;
    await this.stableCoinsRepository.update(id, { mintingEnabled: newMintingStatus });
    
    // 블록체인에서도 상태 업데이트
    await this.blockchainService.toggleMinting(stableCoin.contractAddress);
    
    return this.findOne(id);
  }

  async toggleBurning(id: string, issuerId: string): Promise<StableCoin> {
    const stableCoin = await this.findOne(id);
    
    if (stableCoin.issuerId !== issuerId) {
      throw new ForbiddenException('Only the issuer can toggle burning');
    }

    const newBurningStatus = !stableCoin.burningEnabled;
    await this.stableCoinsRepository.update(id, { burningEnabled: newBurningStatus });
    
    // 블록체인에서도 상태 업데이트
    await this.blockchainService.toggleBurning(stableCoin.contractAddress);
    
    return this.findOne(id);
  }
}