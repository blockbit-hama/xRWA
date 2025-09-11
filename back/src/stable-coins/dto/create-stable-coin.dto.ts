import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateStableCoinDto {
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
  @IsBoolean()
  mintingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  burningEnabled?: boolean;
}