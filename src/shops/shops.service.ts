import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shop } from "./entity/shop.entity";
import { CreateShopDto } from "./dto/create-shop.dto";
import { updateShopDto } from "./dto/update-shop.dto";
import { User } from "src/auth/entity/user.entity";
import { UserRole } from "src/common/enum/roles.enum";
import { S } from "node_modules/@faker-js/faker/dist/airline-Dz1uGqgJ";

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopRepo: Repository<Shop>,
  ) {}

  async createShop(dto: CreateShopDto, sellerId: string) {
    if (!sellerId) {
      throw new BadRequestException("Invalid authenticated user");
    }

    const existing = await this.shopRepo.findOne({
      where: { seller: { id: sellerId } },
    });

    if (existing) {
      throw new BadRequestException("Seller already registered a shop");
    }

    const shop = this.shopRepo.create({
      ...dto,
      seller: { id: sellerId },
    });

    return this.shopRepo.save(shop);
  }

  async updateShop(dto: updateShopDto, sellerId: string, user) {
    const shop = await this.shopRepo.findOne({
      where: { seller: { id: sellerId } },
    });

    if (!shop) {
      throw new BadRequestException("Shop not found");
    }

    if (shop.seller.id !== user.id) {
      throw new BadRequestException("Unauthorized to update this shop");
    }

    await this.shopRepo.update(shop.id, dto);
  }

  async getAllShops(query: any) {
    const {
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = query;

    const qb = this.shopRepo
      .createQueryBuilder("shop")
      .leftJoinAndSelect("shop.seller", "seller");

    if (search) {
      qb.andWhere(
        "LOWER(shop.shopName) LIKE LOWER(:search) OR CAST(shop.id as TEXT) LIKE LOWER(:search) LIKE : search",
        { search: `%${search}%` },
      );
    }

    if (fromDate && toDate) {
      qb.andWhere("shop.createdAt BETWEEN :fromDate AND :toDate", {
        fromDate,
        toDate,
      });
    }

    qb.orderBy(`shop.${sortBy}`, sortOrder);

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      data,
    };
  }

  async getShopById(id: string) {
    const shop = await this.shopRepo.findOne({
      where: { id },
      relations: ["seller"],
    });

    if (!shop) {
      throw new BadRequestException("Shop not found");
    }

    return shop;
  }

  async deleteShop(id: string, user) {
    const shop = await this.shopRepo.findOne({
      where: { id },
      relations: ["seller"],
    });

    if (!shop) {
      throw new BadRequestException("Shop not found");
    }

    if (user.role !== UserRole.ADMIN && shop.seller.id !== user.id) {
      throw new BadRequestException("Unauthorized to delete this shop");
    }

    await this.shopRepo.delete(id);

    return { message: "Shop deleted successfully" };
  }
}
