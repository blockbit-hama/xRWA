import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { InvestmentStatus } from '../investment.entity';

export class CreateInvestmentDto {
  @IsString()
  investmentId: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  tokenAmount: number;

  @IsOptional()
  @IsEnum(InvestmentStatus)
  status?: InvestmentStatus;

  @IsOptional()
  @IsString()
  fundingConfirmationHash?: string;

  @IsOptional()
  @IsNumber()
  lockPeriod?: number;

  @IsOptional()
  @IsDateString()
  lockReleaseDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsUUID()
  investorId: string;

  @IsUUID()
  tokenId: string;
}