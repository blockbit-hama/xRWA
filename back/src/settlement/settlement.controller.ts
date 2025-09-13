import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SettlementService, BankWebhookData } from './settlement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('settlement')
@UseGuards(JwtAuthGuard)
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post('webhook/bank')
  async processBankWebhook(@Body() webhookData: BankWebhookData) {
    return this.settlementService.processBankWebhook(webhookData);
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
    return this.settlementService.confirmFunding(
      investmentId,
      body.fundingConfirmationHash,
      body.actualAmount,
    );
  }

  @Post('investments/:investmentId/approve')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  approveInvestmentForTokenIssuance(@Param('investmentId') investmentId: string) {
    return this.settlementService.approveInvestmentForTokenIssuance(investmentId);
  }

  @Get('report')
  @UseGuards(RolesGuard)
  @Roles('viewer', 'issuer', 'admin')
  generateSettlementReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.settlementService.generateSettlementReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('viewer', 'issuer', 'admin')
  getPendingSettlements() {
    return this.settlementService.getPendingSettlements();
  }

  @Get('funded')
  @UseGuards(RolesGuard)
  @Roles('viewer', 'issuer', 'admin')
  getFundedInvestments() {
    return this.settlementService.getFundedInvestments();
  }
}