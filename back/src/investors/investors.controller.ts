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
import { InvestorsService } from './investors.service';
import { CreateInvestorDto } from './dto/create-investor.dto';
import { UpdateInvestorDto } from './dto/update-investor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('investors')
@UseGuards(JwtAuthGuard)
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  create(@Body() createInvestorDto: CreateInvestorDto) {
    return this.investorsService.create(createInvestorDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('viewer', 'issuer', 'admin')
  findAll() {
    return this.investorsService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('viewer', 'issuer', 'admin')
  findOne(@Param('id') id: string) {
    return this.investorsService.findOne(id);
  }

  @Get('by-investor-id/:investorId')
  @UseGuards(RolesGuard)
  @Roles('viewer', 'issuer', 'admin')
  findByInvestorId(@Param('investorId') investorId: string) {
    return this.investorsService.findByInvestorId(investorId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  update(@Param('id') id: string, @Body() updateInvestorDto: UpdateInvestorDto) {
    return this.investorsService.update(id, updateInvestorDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.investorsService.remove(id);
  }

  @Post(':investorId/wallets')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  addWallet(
    @Param('investorId') investorId: string,
    @Body() body: { address: string; label?: string },
  ) {
    return this.investorsService.addWallet(investorId, body.address, body.label);
  }

  @Get(':investorId/wallets')
  @UseGuards(RolesGuard)
  @Roles('viewer', 'issuer', 'admin')
  getWallets(@Param('investorId') investorId: string) {
    return this.investorsService.getWallets(investorId);
  }

  @Patch(':investorId/kyc')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  updateKYCStatus(
    @Param('investorId') investorId: string,
    @Body() kycData: { verified: boolean; expiryDate?: string; proofHash?: string },
  ) {
    return this.investorsService.updateKYCStatus(investorId, {
      ...kycData,
      expiryDate: kycData.expiryDate ? new Date(kycData.expiryDate) : undefined,
    });
  }

  @Patch(':investorId/attributes')
  @UseGuards(RolesGuard)
  @Roles('issuer', 'admin')
  updateInvestorAttributes(
    @Param('investorId') investorId: string,
    @Body() attributes: {
      accreditedInvestor?: boolean;
      qualifiedInvestor?: boolean;
      professionalInvestor?: boolean;
    },
  ) {
    return this.investorsService.updateInvestorAttributes(investorId, attributes);
  }
}