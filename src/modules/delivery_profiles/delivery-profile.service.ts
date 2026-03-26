import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeliveryProfileDto } from './dto/create-delivery-profile.dto';
import { UpdateDeliveryProfileDto } from './dto/update-delivery-profile.dto';
import { DeliveryProfile } from './entity/delivery-profile.entity';
import { UserRole } from 'src/common/enum/roles.enum';

@Injectable()
export class DeliveryProfileService {
  constructor(
    @InjectRepository(DeliveryProfile)
    private repo: Repository<DeliveryProfile>,
  ) {}

  // CREATE
  async create(dto: CreateDeliveryProfileDto, user) {
    const authUserId = user?.id ?? user?.userId;
    const existing = await this.repo.findOne({
      where: { user: { id: authUserId } },
    });

    if (existing) {
      throw new BadRequestException('Profile already exists');
    }

    const profile = this.repo.create({
      ...dto,
      user: { id: authUserId },
    });

    return this.repo.save(profile);
  }

  // GET ALL (ADMIN)
  async findAll() {
    return this.repo.find({ relations: ['user'] });
  }

  // GET BY ID
  async findById(id: number, user) {
    const authUserId = user?.id ?? user?.userId;
    const profile = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) throw new NotFoundException('Not found');

    if (user.role !== UserRole.ADMIN && profile.user.id !== authUserId) {
      throw new ForbiddenException('Access denied');
    }

    return profile;
  }

  // UPDATE
  async update(id: number, dto: UpdateDeliveryProfileDto, user) {
    const authUserId = user?.id ?? user?.userId;
    const profile = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) throw new NotFoundException('Not found');

    if (user.role !== UserRole.ADMIN && profile.user.id !== authUserId) {
      throw new ForbiddenException('Access denied');
    }

    await this.repo.update(id, dto);

    return { message: 'Updated successfully' };
  }
}
