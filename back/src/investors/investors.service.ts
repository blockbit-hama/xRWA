import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investor } from './investor.entity';
import { CreateInvestorDto } from './dto/create-investor.dto';
import { UpdateInvestorDto } from './dto/update-investor.dto';
import { Wallet } from '../wallets/wallet.entity';

@Injectable()
export class InvestorsService {
  constructor(
    @InjectRepository(Investor)
    private investorsRepository: Repository<Investor>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
  ) {}

  async create(createInvestorDto: CreateInvestorDto): Promise<Investor> {
    // Check if investor ID already exists
    const existingInvestor = await this.investorsRepository.findOne({
      where: { investorId: createInvestorDto.investorId },
    });

    if (existingInvestor) {
      throw new ConflictException('Investor ID already exists');
    }

    // Check if email already exists
    const existingEmail = await this.investorsRepository.findOne({
      where: { email: createInvestorDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const investor = this.investorsRepository.create(createInvestorDto);
    return this.investorsRepository.save(investor);
  }

  async findAll(): Promise<Investor[]> {
    return this.investorsRepository.find({
      relations: ['wallets'],
    });
  }

  async findOne(id: string): Promise<Investor> {
    const investor = await this.investorsRepository.findOne({
      where: { id },
      relations: ['wallets', 'investments'],
    });

    if (!investor) {
      throw new NotFoundException('Investor not found');
    }

    return investor;
  }

  async findByInvestorId(investorId: string): Promise<Investor> {
    const investor = await this.investorsRepository.findOne({
      where: { investorId },
      relations: ['wallets', 'investments'],
    });

    if (!investor) {
      throw new NotFoundException('Investor not found');
    }

    return investor;
  }

  async update(id: string, updateInvestorDto: UpdateInvestorDto): Promise<Investor> {
    const investor = await this.findOne(id);
    
    Object.assign(investor, updateInvestorDto);
    return this.investorsRepository.save(investor);
  }

  async remove(id: string): Promise<void> {
    const investor = await this.findOne(id);
    await this.investorsRepository.remove(investor);
  }

  async addWallet(investorId: string, walletAddress: string, label?: string): Promise<Wallet> {
    const investor = await this.findByInvestorId(investorId);

    // Check if wallet already exists
    const existingWallet = await this.walletsRepository.findOne({
      where: { address: walletAddress },
    });

    if (existingWallet) {
      throw new ConflictException('Wallet address already exists');
    }

    const wallet = this.walletsRepository.create({
      address: walletAddress,
      label,
      investorId: investor.id,
      isActive: true,
    });

    return this.walletsRepository.save(wallet);
  }

  async getWallets(investorId: string): Promise<Wallet[]> {
    const investor = await this.findByInvestorId(investorId);
    return this.walletsRepository.find({
      where: { investorId: investor.id },
    });
  }

  async updateKYCStatus(investorId: string, kycData: {
    verified: boolean;
    expiryDate?: Date;
    proofHash?: string;
  }): Promise<Investor> {
    const investor = await this.findByInvestorId(investorId);
    
    investor.kycVerified = kycData.verified;
    investor.kycExpiryDate = kycData.expiryDate;
    investor.kycProofHash = kycData.proofHash;

    return this.investorsRepository.save(investor);
  }

  async updateInvestorAttributes(investorId: string, attributes: {
    accreditedInvestor?: boolean;
    qualifiedInvestor?: boolean;
    professionalInvestor?: boolean;
  }): Promise<Investor> {
    const investor = await this.findByInvestorId(investorId);
    
    if (attributes.accreditedInvestor !== undefined) {
      investor.accreditedInvestor = attributes.accreditedInvestor;
    }
    if (attributes.qualifiedInvestor !== undefined) {
      investor.qualifiedInvestor = attributes.qualifiedInvestor;
    }
    if (attributes.professionalInvestor !== undefined) {
      investor.professionalInvestor = attributes.professionalInvestor;
    }

    return this.investorsRepository.save(investor);
  }
}