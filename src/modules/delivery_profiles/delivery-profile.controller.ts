import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';

import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { DeliveryProfileService } from './delivery-profile.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { CreateDeliveryProfileDto } from './dto/create-delivery-profile.dto';
import { UpdateDeliveryProfileDto } from './dto/update-delivery-profile.dto';
import { UserRole } from 'src/common/enum/roles.enum';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FilterDeliveryProfileDto } from './dto/filter-delivery-profile.dto';

@ApiTags('Delivery Profile')
@Controller('delivery-profile')
export class DeliveryProfileController {
  constructor(private service: DeliveryProfileService) {}

  @Post()
  create(@Body() dto: CreateDeliveryProfileDto, @Req() req) {
    return this.service.create(dto, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiQuery({ type: FilterDeliveryProfileDto })
  findAll(@Query() query: FilterDeliveryProfileDto) {
    return this.service.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DELIVERY)
  findById(@Param('id') id: number, @Req() req) {
    return this.service.findById(id, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DELIVERY)
  update(
    @Param('id') id: number,
    @Body() dto: UpdateDeliveryProfileDto,
    @Req() req,
  ) {
    return this.service.update(id, dto, req.user);
  }
}
