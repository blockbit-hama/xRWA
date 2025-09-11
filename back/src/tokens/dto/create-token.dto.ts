import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { TokenStatus } from '../token.entity';

export class CreateTokenDto {
  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsNumber()
  decimals: number;

  @IsNumber()
  totalSupply: number;

  @IsOptional()
  @IsString()
  contractAddress?: string;

  @IsOptional()
  @IsEnum(TokenStatus)
  status?: TokenStatus;

  @IsOptional()
  @IsBoolean()
  mintingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  burningEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  paused?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  issuerId?: string;
}