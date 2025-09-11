import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('tokens')
@UseGuards(JwtAuthGuard)
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.create(createTokenDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  findAll() {
    return this.tokensService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  findOne(@Param('id') id: string) {
    return this.tokensService.findOne(id);
  }

  @Get('by-symbol/:symbol')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  findBySymbol(@Param('symbol') symbol: string) {
    return this.tokensService.findBySymbol(symbol);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.tokensService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.tokensService.remove(id);
  }

  @Post(':tokenId/issue')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  issueTokens(
    @Param('tokenId') tokenId: string,
    @Body() body: {
      investorId: string;
      amount: number;
      lockPeriod?: number;
      reason?: string;
    },
  ) {
    return this.tokensService.issueTokens(
      tokenId,
      body.investorId,
      body.amount,
      body.lockPeriod,
      body.reason,
    );
  }

  @Post('investments/:investmentId/confirm-funding')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  confirmFunding(
    @Param('investmentId') investmentId: string,
    @Body() body: {
      fundingConfirmationHash: string;
      actualAmount: number;
    },
  ) {
    return this.tokensService.confirmFunding(
      investmentId,
      body.fundingConfirmationHash,
      body.actualAmount,
    );
  }

  @Post('investments/:investmentId/execute-issuance')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  executeTokenIssuance(
    @Param('investmentId') investmentId: string,
    @Body() body: { transactionHash: string },
  ) {
    return this.tokensService.executeTokenIssuance(
      investmentId,
      body.transactionHash,
    );
  }

  @Post(':tokenId/pause')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  pauseToken(@Param('tokenId') tokenId: string) {
    return this.tokensService.pauseToken(tokenId);
  }

  @Post(':tokenId/unpause')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  unpauseToken(@Param('tokenId') tokenId: string) {
    return this.tokensService.unpauseToken(tokenId);
  }

  @Get(':tokenId/stats')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  getTokenStats(@Param('tokenId') tokenId: string) {
    return this.tokensService.getTokenStats(tokenId);
  }
}