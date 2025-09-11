import { IsString, IsNumber, IsPositive, MinLength } from 'class-validator';

export class CreateStableCoinDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  symbol: string;

  @IsNumber()
  @IsPositive()
  decimals: number;

  @IsString()
  maxSupply: string;
}