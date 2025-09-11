import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { CreateTokenDto } from './dto/create-token.dto';
import { Investment } from '../investments/investment.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
    @InjectRepository(Investment)
    private investmentsRepository: Repository<Investment>,
  ) {}

  async create(createTokenDto: CreateTokenDto): Promise<Token> {
    // Check if symbol already exists
    const existingToken = await this.tokensRepository.findOne({
      where: { symbol: createTokenDto.symbol },
    });

    if (existingToken) {
      throw new ConflictException('Token symbol already exists');
    }

    const token = this.tokensRepository.create({
      ...createTokenDto,
      totalIssued: 0,
    });

    return this.tokensRepository.save(token);
  }

  async findAll(): Promise<Token[]> {
    return this.tokensRepository.find({
      relations: ['investments'],
    });
  }

  async findOne(id: string): Promise<Token> {
    const token = await this.tokensRepository.findOne({
      where: { id },
      relations: ['investments'],
    });

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    return token;
  }

  async findBySymbol(symbol: string): Promise<Token> {
    const token = await this.tokensRepository.findOne({
      where: { symbol },
      relations: ['investments'],
    });

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    return token;
  }

  async update(id: string, updateData: Partial<Token>): Promise<Token> {
    const token = await this.findOne(id);
    
    Object.assign(token, updateData);
    return this.tokensRepository.save(token);
  }

  async remove(id: string): Promise<void> {
    const token = await this.findOne(id);
    await this.tokensRepository.remove(token);
  }

  async issueTokens(
    tokenId: string,
    investorId: string,
    amount: number,
    lockPeriod?: number,
    reason?: string,
  ): Promise<Investment> {
    const token = await this.findOne(tokenId);

    // Create investment record
    const investment = this.investmentsRepository.create({
      investmentId: `INV-${Date.now()}`,
      amount: 0, // Will be updated when funding is confirmed
      tokenAmount: amount,
      status: 'pending' as any,
      investorId,
      tokenId: token.id,
      lockPeriod,
      reason,
      lockReleaseDate: lockPeriod ? new Date(Date.now() + lockPeriod * 24 * 60 * 60 * 1000) : undefined,
    });

    return this.investmentsRepository.save(investment);
  }

  async confirmFunding(
    investmentId: string,
    fundingConfirmationHash: string,
    actualAmount: number,
  ): Promise<Investment> {
    const investment = await this.investmentsRepository.findOne({
      where: { id: investmentId },
      relations: ['token'],
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    investment.amount = actualAmount;
    investment.fundingConfirmationHash = fundingConfirmationHash;
    investment.status = 'funded' as any;

    return this.investmentsRepository.save(investment);
  }

  async executeTokenIssuance(
    investmentId: string,
    transactionHash: string,
  ): Promise<Investment> {
    const investment = await this.investmentsRepository.findOne({
      where: { id: investmentId },
      relations: ['token'],
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    if (investment.status !== 'funded') {
      throw new ConflictException('Investment must be funded before token issuance');
    }

    investment.transactionHash = transactionHash;
    investment.status = 'issued' as any;

    // Update token total issued
    const token = investment.token;
    token.totalIssued += investment.tokenAmount;
    await this.tokensRepository.save(token);

    return this.investmentsRepository.save(investment);
  }

  async pauseToken(tokenId: string): Promise<Token> {
    const token = await this.findOne(tokenId);
    token.paused = true;
    token.status = 'paused' as any;
    return this.tokensRepository.save(token);
  }

  async unpauseToken(tokenId: string): Promise<Token> {
    const token = await this.findOne(tokenId);
    token.paused = false;
    token.status = 'active' as any;
    return this.tokensRepository.save(token);
  }

  async getTokenStats(tokenId: string): Promise<{
    totalSupply: number;
    totalIssued: number;
    totalInvestments: number;
    totalInvestors: number;
    averageInvestment: number;
  }> {
    const token = await this.findOne(tokenId);
    const investments = await this.investmentsRepository.find({
      where: { tokenId: token.id },
    });

    const totalInvestments = investments.length;
    const totalInvestors = new Set(investments.map(inv => inv.investorId)).size;
    const totalInvestmentAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const averageInvestment = totalInvestments > 0 ? totalInvestmentAmount / totalInvestments : 0;

    return {
      totalSupply: token.totalSupply,
      totalIssued: token.totalIssued,
      totalInvestments,
      totalInvestors,
      averageInvestment,
    };
  }
}