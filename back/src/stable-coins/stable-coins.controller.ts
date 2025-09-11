import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StableCoinsService } from './stable-coins.service';
import { CreateStableCoinDto } from './dto/create-stable-coin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stable-coins')
export class StableCoinsController {
  constructor(private readonly stableCoinsService: StableCoinsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createStableCoinDto: CreateStableCoinDto, @Request() req) {
    return this.stableCoinsService.create(createStableCoinDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.stableCoinsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findByIssuer(@Request() req) {
    return this.stableCoinsService.findByIssuer(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stableCoinsService.findOne(id);
  }

  @Post(':id/mint')
  @UseGuards(JwtAuthGuard)
  mint(@Param('id') id: string, @Body() body: { to: string; amount: string }, @Request() req) {
    return this.stableCoinsService.mint(id, body.to, body.amount, req.user.id);
  }

  @Post(':id/burn')
  @UseGuards(JwtAuthGuard)
  burn(@Param('id') id: string, @Body() body: { amount: string }, @Request() req) {
    return this.stableCoinsService.burn(id, body.amount, req.user.id);
  }

  @Patch(':id/toggle-minting')
  @UseGuards(JwtAuthGuard)
  toggleMinting(@Param('id') id: string, @Request() req) {
    return this.stableCoinsService.toggleMinting(id, req.user.id);
  }

  @Patch(':id/toggle-burning')
  @UseGuards(JwtAuthGuard)
  toggleBurning(@Param('id') id: string, @Request() req) {
    return this.stableCoinsService.toggleBurning(id, req.user.id);
  }
}