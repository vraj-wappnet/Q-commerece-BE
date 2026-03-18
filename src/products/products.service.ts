import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entity/product.entity";
import { Shop } from "src/shops/entity/shop.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UserRole } from "src/common/enum/roles.enum";





import { User } from "src/auth/entity/user.entity";
import { UpdateProductDto } from "./dto/update-product.dto";
import { FilterProductDto } from "./dto/filter-product.dto";
import { Category } from "src/categories/entity/category.entity";
import { SubCategory } from "src/categories/entity/sub-category.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
  ) {}

  async createProduct(dto: CreateProductDto, user: User) {
    const {
      shopId,
      imageUrls,
      discountPercentage,
      categoryId,
      subCategoryId,
      ...productData
    } = dto;

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

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException("Category not found");
    }

    let subCategory: SubCategory | null = null;
    if (subCategoryId) {
      subCategory = await this.subCategoryRepository.findOne({
        where: { id: subCategoryId },
        relations: ["category"],
      });
      if (!subCategory) {
        throw new BadRequestException("SubCategory not found");
      }
      if (subCategory.category?.id !== category.id) {
        throw new BadRequestException("SubCategory does not belong to Category");
      }
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
      category,
      subCategory: subCategory ?? undefined,
    });

    return this.productRepository.save(product);
  }

  async getAllProducts(query: FilterProductDto) {
    const {
      search,
      shopId,
      categoryId,
      subCategoryId,
      sortBy = "createdAt",
      sortOrder = "DESC",
      page = 1,
      limit = 10,
    } = query ?? ({} as FilterProductDto);

    const safeLimit = Math.min(Number(limit) || 10, 100);
    const safePage = Math.max(Number(page) || 1, 1);

    const qb = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.shop", "shop")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.subCategory", "subCategory");

    if (search) {
      qb.andWhere(
        "(product.name ILIKE :search OR product.description ILIKE :search OR product.longDescription ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (shopId) {
      qb.andWhere("shop.id = :shopId", { shopId });
    }

    if (categoryId) {
      qb.andWhere("category.id = :categoryId", { categoryId });
    }

    if (subCategoryId) {
      qb.andWhere("subCategory.id = :subCategoryId", { subCategoryId });
    }

    // Avoid SQL injection on column name
    const allowedSortBy = new Set([
      "createdAt",
      "updatedAt",
      "name",
      "sellingPrice",
      "mrp",
      "stockQuantity",
    ]);
    const sortColumn = allowedSortBy.has(sortBy) ? sortBy : "createdAt";

    qb.orderBy(`product.${sortColumn}`, sortOrder ?? "DESC");
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / safeLimit);

    return {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      data,
    };
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["shop", "shop.seller", "category", "subCategory"],
    });

    if (!product) {
      throw new BadRequestException("Product not found");
    }

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto, user: User) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["shop", "shop.seller", "category", "subCategory"],
    });

    if (!product) {
      throw new BadRequestException("Product not found");
    }

    if (user.role !== UserRole.ADMIN && product.shop?.seller?.id !== user.id) {
      throw new BadRequestException("Unauthorized to update this product");
    }

    let nextShop = product.shop;
    if (dto.shopId && dto.shopId !== product.shop?.id) {
      const shop = await this.shopRepository.findOne({
        where: { id: dto.shopId },
        relations: ["seller"],
      });

      if (!shop) {
        throw new BadRequestException("Shop not found");
      }

      if (user.role !== UserRole.ADMIN && shop.seller.id !== user.id) {
        throw new BadRequestException(
          "You are not authorized to move product to this shop",
        );
      }

      nextShop = shop;
    }

    let nextCategory = product.category;
    if (dto.categoryId && dto.categoryId !== product.category?.id) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException("Category not found");
      }
      nextCategory = category;
    }

    let nextSubCategory: SubCategory | null = product.subCategory ?? null;

    if (dto.subCategoryId) {
      const sub = await this.subCategoryRepository.findOne({
        where: { id: dto.subCategoryId },
        relations: ["category"],
      });
      if (!sub) {
        throw new BadRequestException("SubCategory not found");
      }

      if (nextCategory && sub.category?.id !== nextCategory.id) {
        throw new BadRequestException("SubCategory does not belong to Category");
      }
      nextSubCategory = sub;
    } else if (dto.categoryId && nextSubCategory?.category?.id !== nextCategory?.id) {
      // Category changed but subCategory was not explicitly updated; drop it if it doesn't match.
      nextSubCategory = null;
    }

    // Compute discount if not explicitly provided but pricing changed (or exists).
    const nextMrp = dto.mrp ?? (product.mrp as unknown as number);
    const nextSellingPrice =
      dto.sellingPrice ?? (product.sellingPrice as unknown as number);
    let nextDiscount = dto.discountPercentage;
    if (nextDiscount == null && nextMrp != null && nextSellingPrice != null) {
      const mrpNum = Number(nextMrp);
      const spNum = Number(nextSellingPrice);
      if (Number.isFinite(mrpNum) && mrpNum > 0 && Number.isFinite(spNum)) {
        nextDiscount = Number((((mrpNum - spNum) / mrpNum) * 100).toFixed(2));
      }
    }

    const update: Partial<Product> = {
      ...dto,
      discountPercentage: nextDiscount as any,
      shop: nextShop,
      category: nextCategory,
      subCategory: nextSubCategory,
    };

    // DTO uses imageUrls but entity stores images.
    if (dto.imageUrls) {
      update.images = dto.imageUrls;
    }
    delete (update as any).imageUrls;
    delete (update as any).shopId;
    delete (update as any).categoryId;
    delete (update as any).subCategoryId;

    const merged = this.productRepository.merge(product, update);
    return this.productRepository.save(merged);
  }

  async deleteProduct(id: string, user: User) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["shop", "shop.seller"],
    });

    if (!product) {
      throw new BadRequestException("Product not found");
    }

    if (user.role !== UserRole.ADMIN && product.shop?.seller?.id !== user.id) {
      throw new BadRequestException("Unauthorized to delete this product");
    }

    await this.productRepository.delete(id);
    return { message: "Product deleted successfully" };
  }
}
