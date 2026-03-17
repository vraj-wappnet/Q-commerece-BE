import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entity/product.entity";
import { Shop } from "src/shops/entity/shop.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UserRole } from "src/common/enum/roles.enum";
import { User } from "src/auth/entity/user.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async createProduct(dto: CreateProductDto, user: User) {
    const { shopId, imageUrls, discountPercentage, ...productData } = dto;

    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      relations: ["seller"],
    });

    if (!shop) {
      throw new BadRequestException("Shop not found");
    }

    if (user.role !== UserRole.ADMIN && shop.seller.id !== user.id) {
      throw new BadRequestException(
        "You are not authorized to add product to this shop",
      );
    }

    let discount = discountPercentage;
    if (discount == null) {
      discount = ((dto.mrp - dto.sellingPrice) / dto.mrp) * 100;
    }

    const product = this.productRepository.create({
      ...productData,
      discountPercentage: Number(discount.toFixed(2)),
      images: imageUrls,
      shop,
    });

    return this.productRepository.save(product);
  }
}
