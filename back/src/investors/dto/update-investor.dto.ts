import { PartialType } from '@nestjs/mapped-types';
import { CreateInvestorDto } from './create-investor.dto';
import { IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { InvestorStatus } from '../investor.entity';

export class UpdateInvestorDto extends PartialType(CreateInvestorDto) {
  @IsOptional()
  @IsEnum(InvestorStatus)
  status?: InvestorStatus;

  @IsOptional()
  @IsBoolean()
  kycVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  accreditedInvestor?: boolean;

  @IsOptional()
  @IsBoolean()
  qualifiedInvestor?: boolean;

  @IsOptional()
  @IsBoolean()
  professionalInvestor?: boolean;

  @IsOptional()
  @IsDateString()
  kycExpiryDate?: string;

  @IsOptional()
  @IsString()
  kycProofHash?: string;
}