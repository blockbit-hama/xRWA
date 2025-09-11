import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { InvestorType } from '../investor.entity';

export class CreateInvestorDto {
  @IsString()
  investorId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsEnum(InvestorType)
  type?: InvestorType;

  @IsOptional()
  @IsString()
  collisionHash?: string;
}