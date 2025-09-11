import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from '../investments/investment.entity';
import { Investor } from '../investors/investor.entity';
import { Token } from '../tokens/token.entity';

export interface BankWebhookData {
  transactionId: string;
  amount: number;
  currency: string;
  fromAccount: string;
  toAccount: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @InjectRepository(Investment)
    private investmentsRepository: Repository<Investment>,
    @InjectRepository(Investor)
    private investorsRepository: Repository<Investor>,
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
  ) {}

  async processBankWebhook(webhookData: BankWebhookData): Promise<void> {
    this.logger.log(`Processing bank webhook for transaction ${webhookData.transactionId}`);

    if (webhookData.status !== 'completed') {
      this.logger.warn(`Transaction ${webhookData.transactionId} not completed, skipping`);
      return;
    }

    // Find investment by reference or amount matching
    const investment = await this.findInvestmentByWebhookData(webhookData);
    
    if (!investment) {
      this.logger.warn(`No matching investment found for transaction ${webhookData.transactionId}`);
      return;
    }

    // Verify amount matches
    if (Math.abs(investment.amount - webhookData.amount) > 0.01) {
      this.logger.error(`Amount mismatch for investment ${investment.id}: expected ${investment.amount}, received ${webhookData.amount}`);
      return;
    }

    // Update investment status
    investment.status = 'funded' as any;
    investment.fundingConfirmationHash = webhookData.transactionId;
    await this.investmentsRepository.save(investment);

    this.logger.log(`Investment ${investment.id} funded successfully`);
  }

  async confirmFunding(
    investmentId: string,
    fundingConfirmationHash: string,
    actualAmount: number,
  ): Promise<Investment> {
    const investment = await this.investmentsRepository.findOne({
      where: { id: investmentId },
      relations: ['investor', 'token'],
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    investment.amount = actualAmount;
    investment.fundingConfirmationHash = fundingConfirmationHash;
    investment.status = 'funded' as any;

    return this.investmentsRepository.save(investment);
  }

  async approveInvestmentForTokenIssuance(investmentId: string): Promise<Investment> {
    const investment = await this.investmentsRepository.findOne({
      where: { id: investmentId },
      relations: ['investor', 'token'],
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    if (investment.status !== 'funded') {
      throw new Error('Investment must be funded before approval');
    }

    // Verify investor compliance
    await this.verifyInvestorCompliance(investment.investor);

    investment.status = 'approved' as any;
    return this.investmentsRepository.save(investment);
  }

  async generateSettlementReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalInvestments: number;
    totalAmount: number;
    totalTokenAmount: number;
    fundedInvestments: number;
    pendingInvestments: number;
    rejectedInvestments: number;
    averageInvestment: number;
    investments: Investment[];
  }> {
    const investments = await this.investmentsRepository.find({
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        } as any,
      },
      relations: ['investor', 'token'],
    });

    const totalInvestments = investments.length;
    const totalAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalTokenAmount = investments.reduce((sum, inv) => sum + inv.tokenAmount, 0);
    const fundedInvestments = investments.filter(inv => inv.status === 'funded').length;
    const pendingInvestments = investments.filter(inv => inv.status === 'pending').length;
    const rejectedInvestments = investments.filter(inv => inv.status === 'rejected').length;
    const averageInvestment = totalInvestments > 0 ? totalAmount / totalInvestments : 0;

    return {
      totalInvestments,
      totalAmount,
      totalTokenAmount,
      fundedInvestments,
      pendingInvestments,
      rejectedInvestments,
      averageInvestment,
      investments,
    };
  }

  async getPendingSettlements(): Promise<Investment[]> {
    return this.investmentsRepository.find({
      where: { status: 'pending' as any },
      relations: ['investor', 'token'],
    });
  }

  async getFundedInvestments(): Promise<Investment[]> {
    return this.investmentsRepository.find({
      where: { status: 'funded' as any },
      relations: ['investor', 'token'],
    });
  }

  private async findInvestmentByWebhookData(webhookData: BankWebhookData): Promise<Investment | null> {
    // Try to find by reference first
    if (webhookData.reference) {
      const investment = await this.investmentsRepository.findOne({
        where: { investmentId: webhookData.reference },
        relations: ['investor', 'token'],
      });
      if (investment) return investment;
    }

    // Try to find by amount and investor account
    const investments = await this.investmentsRepository.find({
      where: { status: 'pending' as any },
      relations: ['investor'],
    });

    // This is a simplified matching - in reality, you'd have more sophisticated logic
    return investments.find(inv => 
      Math.abs(inv.amount - webhookData.amount) < 0.01
    ) || null;
  }

  private async verifyInvestorCompliance(investor: Investor): Promise<void> {
    if (!investor.kycVerified) {
      throw new Error('Investor KYC not verified');
    }

    if (investor.status !== 'approved') {
      throw new Error('Investor not approved');
    }

    // Check KYC expiry
    if (investor.kycExpiryDate && investor.kycExpiryDate < new Date()) {
      throw new Error('Investor KYC expired');
    }
  }
}