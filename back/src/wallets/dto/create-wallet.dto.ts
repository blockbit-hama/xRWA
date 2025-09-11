import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  blockchainNetwork?: string;

  @IsUUID()
  investorId: string;
}