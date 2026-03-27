import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeliveryProfileDto } from './dto/create-delivery-profile.dto';
import { UpdateDeliveryProfileDto } from './dto/update-delivery-profile.dto';
import { DeliveryProfile } from './entity/delivery-profile.entity';
import { UserRole } from 'src/common/enum/roles.enum';
import { MESSAGES } from 'src/common/constant/message';
import { FilterDeliveryProfileDto } from './dto/filter-delivery-profile.dto';

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

    const savedProfile = await this.repo.save(profile);
    return {
      statusCode: HttpStatus.CREATED,
      message: MESSAGES.DELIVERY_PROFILE.CREATED,
      data: savedProfile,
    };
  }

  // GET ALL (ADMIN)
  async findAll(query: FilterDeliveryProfileDto = {}) {
    const {
      search,
      userId,
      city,
      state,
      pincode,
      vehicleType,
      isAvailable,
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = query;

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const allowedSortBy = new Set([
      'createdAt',
      'updatedAt',
      'city',
      'state',
      'vehicleType',
      'isAvailable',
    ]);
    const safeSortBy = allowedSortBy.has(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const createdFromDate = createdFrom ? new Date(createdFrom) : null;
    const createdToDate = createdTo ? new Date(createdTo) : null;
    const updatedFromDate = updatedFrom ? new Date(updatedFrom) : null;
    const updatedToDate = updatedTo ? new Date(updatedTo) : null;

    if (createdFrom && Number.isNaN(createdFromDate?.getTime())) {
      throw new BadRequestException('Invalid createdFrom date');
    }
    if (createdTo && Number.isNaN(createdToDate?.getTime())) {
      throw new BadRequestException('Invalid createdTo date');
    }
    if (updatedFrom && Number.isNaN(updatedFromDate?.getTime())) {
      throw new BadRequestException('Invalid updatedFrom date');
    }
    if (updatedTo && Number.isNaN(updatedToDate?.getTime())) {
      throw new BadRequestException('Invalid updatedTo date');
    }
    if (createdFromDate && createdToDate && createdFromDate > createdToDate) {
      throw new BadRequestException('createdFrom must be before or equal to createdTo');
    }
    if (updatedFromDate && updatedToDate && updatedFromDate > updatedToDate) {
      throw new BadRequestException('updatedFrom must be before or equal to updatedTo');
    }

    let normalizedIsAvailable: boolean | undefined;
    if (typeof isAvailable === 'boolean') {
      normalizedIsAvailable = isAvailable;
    } else if (typeof isAvailable === 'string') {
      const lowered = isAvailable.toLowerCase();
      if (lowered === 'true') normalizedIsAvailable = true;
      else if (lowered === 'false') normalizedIsAvailable = false;
      else throw new BadRequestException('isAvailable must be true or false');
    }

    const qb = this.repo
      .createQueryBuilder('deliveryProfile')
      .leftJoinAndSelect('deliveryProfile.user', 'user');

    if (search) {
      qb.andWhere(
        `(user.firstName ILIKE :search
          OR user.lastName ILIKE :search
          OR user.email ILIKE :search
          OR user.mobile ILIKE :search
          OR deliveryProfile.vehicleType ILIKE :search
          OR deliveryProfile.vehicleName ILIKE :search
          OR deliveryProfile.city ILIKE :search
          OR deliveryProfile.state ILIKE :search
          OR deliveryProfile.pincode ILIKE :search
          OR deliveryProfile.addressLine1 ILIKE :search
          OR deliveryProfile.addressLine2 ILIKE :search)`,
        { search: `%${search.trim()}%` },
      );
    }

    if (userId) {
      qb.andWhere('user.id = :userId', { userId });
    }

    if (city) {
      qb.andWhere('deliveryProfile.city ILIKE :city', { city: `%${city.trim()}%` });
    }

    if (state) {
      qb.andWhere('deliveryProfile.state ILIKE :state', { state: `%${state.trim()}%` });
    }

    if (pincode) {
      qb.andWhere('deliveryProfile.pincode ILIKE :pincode', {
        pincode: `%${pincode.trim()}%`,
      });
    }

    if (vehicleType) {
      qb.andWhere('deliveryProfile.vehicleType ILIKE :vehicleType', {
        vehicleType: `%${vehicleType.trim()}%`,
      });
    }

    if (normalizedIsAvailable !== undefined) {
      qb.andWhere('deliveryProfile.isAvailable = :isAvailable', {
        isAvailable: normalizedIsAvailable,
      });
    }

    if (createdFromDate) {
      qb.andWhere('deliveryProfile.createdAt >= :createdFromDate', {
        createdFromDate,
      });
    }

    if (createdToDate) {
      qb.andWhere('deliveryProfile.createdAt <= :createdToDate', { createdToDate });
    }

    if (updatedFromDate) {
      qb.andWhere('deliveryProfile.updatedAt >= :updatedFromDate', {
        updatedFromDate,
      });
    }

    if (updatedToDate) {
      qb.andWhere('deliveryProfile.updatedAt <= :updatedToDate', { updatedToDate });
    }

    qb.orderBy(`deliveryProfile.${safeSortBy}`, safeSortOrder);
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [profiles, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / safeLimit) || 1;

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.DELIVERY_PROFILE.LIST_FETCHED,
      data: {
        items: profiles,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  // GET BY ID
  async findById(id: number, user) {
    const authUserId = user?.id ?? user?.userId;
    const profile = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) throw new NotFoundException('Not found');

    if (user.role?.name !== 'ADMIN' && profile.user.id !== authUserId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.DELIVERY_PROFILE.FETCHED,
      data: profile,
    };
  }

  // UPDATE
  async update(id: number, dto: UpdateDeliveryProfileDto, user) {
    const authUserId = user?.id ?? user?.userId;
    const profile = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) throw new NotFoundException('Not found');

    if (user.role?.name !== 'ADMIN' && profile.user.id !== authUserId) {
      throw new ForbiddenException('Access denied');
    }

    await this.repo.update(id, dto);
    const updatedProfile = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.DELIVERY_PROFILE.UPDATED,
      data: updatedProfile,
    };
  }
}
