import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entity/category.entity";
import { SubCategory } from "./entity/sub-category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateSubCategoryDto } from "./dto/create-subcategory.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateSubCategoryDto } from "./dto/update-subcategory.dto";
import { Product } from "src/modules/products/entity/product.entity";
import { MESSAGES } from "src/common/constant/message";
import { FilterCategoryDto } from "./dto/filter-category.dto";
import { FilterSubCategoryDto } from "./dto/filter-subcategory.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getAll(query: FilterCategoryDto = {}) {
    const {
      search,
      name,
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo,
      sortBy = "name",
      sortOrder = "ASC",
      page = 1,
      limit = 10,
    } = query;

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const allowedSortBy = new Set(["name", "createdAt", "updatedAt"]);
    const safeSortBy = allowedSortBy.has(sortBy) ? sortBy : "name";
    const safeSortOrder = String(sortOrder).toUpperCase() === "DESC" ? "DESC" : "ASC";

    const createdFromDate = createdFrom ? new Date(createdFrom) : null;
    const createdToDate = createdTo ? new Date(createdTo) : null;
    const updatedFromDate = updatedFrom ? new Date(updatedFrom) : null;
    const updatedToDate = updatedTo ? new Date(updatedTo) : null;

    if (createdFrom && Number.isNaN(createdFromDate?.getTime())) {
      throw new BadRequestException("Invalid createdFrom date");
    }
    if (createdTo && Number.isNaN(createdToDate?.getTime())) {
      throw new BadRequestException("Invalid createdTo date");
    }
    if (updatedFrom && Number.isNaN(updatedFromDate?.getTime())) {
      throw new BadRequestException("Invalid updatedFrom date");
    }
    if (updatedTo && Number.isNaN(updatedToDate?.getTime())) {
      throw new BadRequestException("Invalid updatedTo date");
    }
    if (createdFromDate && createdToDate && createdFromDate > createdToDate) {
      throw new BadRequestException("createdFrom must be before or equal to createdTo");
    }
    if (updatedFromDate && updatedToDate && updatedFromDate > updatedToDate) {
      throw new BadRequestException("updatedFrom must be before or equal to updatedTo");
    }

    const qb = this.categoryRepo
      .createQueryBuilder("category")
      .leftJoinAndSelect("category.subCategories", "subCategory");

    if (search) {
      qb.andWhere("category.name ILIKE :search", { search: `%${search.trim()}%` });
    }

    if (name) {
      qb.andWhere("category.name ILIKE :name", { name: `%${name.trim()}%` });
    }

    if (createdFromDate) {
      qb.andWhere("category.createdAt >= :createdFromDate", { createdFromDate });
    }

    if (createdToDate) {
      qb.andWhere("category.createdAt <= :createdToDate", { createdToDate });
    }

    if (updatedFromDate) {
      qb.andWhere("category.updatedAt >= :updatedFromDate", { updatedFromDate });
    }

    if (updatedToDate) {
      qb.andWhere("category.updatedAt <= :updatedToDate", { updatedToDate });
    }

    qb.orderBy(`category.${safeSortBy}`, safeSortOrder);
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [categories, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / safeLimit) || 1;

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CATEGORY.LIST_FETCHED,
      data: {
        items: categories,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  async getAllSubCategories(query: FilterSubCategoryDto = {}) {
    const {
      search,
      name,
      categoryId,
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo,
      sortBy = "name",
      sortOrder = "ASC",
      page = 1,
      limit = 10,
    } = query;

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const allowedSortBy = new Set(["name", "createdAt", "updatedAt"]);
    const safeSortBy = allowedSortBy.has(sortBy) ? sortBy : "name";
    const safeSortOrder = String(sortOrder).toUpperCase() === "DESC" ? "DESC" : "ASC";

    const createdFromDate = createdFrom ? new Date(createdFrom) : null;
    const createdToDate = createdTo ? new Date(createdTo) : null;
    const updatedFromDate = updatedFrom ? new Date(updatedFrom) : null;
    const updatedToDate = updatedTo ? new Date(updatedTo) : null;

    if (createdFrom && Number.isNaN(createdFromDate?.getTime())) {
      throw new BadRequestException("Invalid createdFrom date");
    }
    if (createdTo && Number.isNaN(createdToDate?.getTime())) {
      throw new BadRequestException("Invalid createdTo date");
    }
    if (updatedFrom && Number.isNaN(updatedFromDate?.getTime())) {
      throw new BadRequestException("Invalid updatedFrom date");
    }
    if (updatedTo && Number.isNaN(updatedToDate?.getTime())) {
      throw new BadRequestException("Invalid updatedTo date");
    }
    if (createdFromDate && createdToDate && createdFromDate > createdToDate) {
      throw new BadRequestException("createdFrom must be before or equal to createdTo");
    }
    if (updatedFromDate && updatedToDate && updatedFromDate > updatedToDate) {
      throw new BadRequestException("updatedFrom must be before or equal to updatedTo");
    }

    const qb = this.subCategoryRepo
      .createQueryBuilder("subCategory")
      .leftJoinAndSelect("subCategory.category", "category");

    if (search) {
      qb.andWhere(
        "(subCategory.name ILIKE :search OR category.name ILIKE :search)",
        { search: `%${search.trim()}%` },
      );
    }

    if (name) {
      qb.andWhere("subCategory.name ILIKE :name", { name: `%${name.trim()}%` });
    }

    if (categoryId) {
      qb.andWhere("category.id = :categoryId", { categoryId });
    }

    if (createdFromDate) {
      qb.andWhere("subCategory.createdAt >= :createdFromDate", { createdFromDate });
    }

    if (createdToDate) {
      qb.andWhere("subCategory.createdAt <= :createdToDate", { createdToDate });
    }

    if (updatedFromDate) {
      qb.andWhere("subCategory.updatedAt >= :updatedFromDate", { updatedFromDate });
    }

    if (updatedToDate) {
      qb.andWhere("subCategory.updatedAt <= :updatedToDate", { updatedToDate });
    }

    qb.orderBy(`subCategory.${safeSortBy}`, safeSortOrder);
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [subCategories, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / safeLimit) || 1;

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CATEGORY.SUBCATEGORY_LIST_FETCHED,
      data: {
        items: subCategories,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  async getSubCategoriesByCategory(categoryId: string) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new BadRequestException("Category not found");

    const subCategories = await this.subCategoryRepo.find({
      where: { category: { id: categoryId } },
      order: { name: "ASC" },
      relations: ["category"],
    });
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CATEGORY.SUBCATEGORY_LIST_FETCHED,
      data: subCategories,
    };
  }

  async createCategory(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    const existing = await this.categoryRepo.findOne({ where: { name } });
    if (existing) {
      throw new BadRequestException("Category already exists");
    }

    const category = this.categoryRepo.create({ name });
    const savedCategory = await this.categoryRepo.save(category);
    return {
      statusCode: HttpStatus.CREATED,
      message: MESSAGES.CATEGORY.CREATED,
      data: savedCategory,
    };
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new BadRequestException("Category not found");

    // Prevent deleting categories that are used by products.
    const used = await this.productRepo.count({ where: { category: { id } } });
    if (used > 0) {
      throw new BadRequestException("Category is used by products");
    }

    await this.categoryRepo.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CATEGORY.DELETED,
      data: null,
    };
  }

  async createSubCategory(categoryId: string, dto: CreateSubCategoryDto) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new BadRequestException("Category not found");

    const name = dto.name.trim();
    const existing = await this.subCategoryRepo.findOne({
      where: { category: { id: categoryId }, name },
      relations: ["category"],
    });
    if (existing) {
      throw new BadRequestException("SubCategory already exists");
    }

    const sub = this.subCategoryRepo.create({ name, category });
    const savedSubCategory = await this.subCategoryRepo.save(sub);
    return {
      statusCode: HttpStatus.CREATED,
      message: MESSAGES.CATEGORY.SUBCATEGORY_CREATED,
      data: savedSubCategory,
    };
  }

  async deleteSubCategory(id: string) {
    const sub = await this.subCategoryRepo.findOne({
      where: { id },
      relations: ["category"],
    });
    if (!sub) throw new BadRequestException("SubCategory not found");

    const used = await this.productRepo.count({
      where: { subCategory: { id } },
    });
    if (used > 0) {
      throw new BadRequestException("SubCategory is used by products");
    }

    await this.subCategoryRepo.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CATEGORY.SUBCATEGORY_DELETED,
      data: null,
    };
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new BadRequestException("Category not found");

    if (dto.name) {
      const trimmedName = dto.name.trim();
      const existing = await this.categoryRepo.findOne({ 
        where: { name: trimmedName } 
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException("Category name already exists");
      }
      category.name = trimmedName;
    }

    await this.categoryRepo.save(category);
    const updatedCategory = await this.categoryRepo.findOne({
      where: { id },
      relations: ["subCategories"],
    });
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CATEGORY.UPDATED,
      data: updatedCategory,
    };
  }

  async updateSubCategory(id: string, dto: UpdateSubCategoryDto) {
    const sub = await this.subCategoryRepo.findOne({
      where: { id },
      relations: ["category"],
    });
    if (!sub) throw new BadRequestException("SubCategory not found");

    if (dto.name) {
      const trimmedName = dto.name.trim();
      const existing = await this.subCategoryRepo.findOne({
        where: { 
          name: trimmedName,
          category: { id: dto.categoryId || sub.category.id }
        },
        relations: ["category"],
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException("SubCategory name already exists in this category");
      }
      sub.name = trimmedName;
    }

    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({ 
        where: { id: dto.categoryId } 
      });
      if (!category) throw new BadRequestException("Category not found");
      sub.category = category;
    }

    await this.subCategoryRepo.save(sub);
    const updatedSubCategory = await this.subCategoryRepo.findOne({
      where: { id },
      relations: ["category"],
    });
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CATEGORY.SUBCATEGORY_UPDATED,
      data: updatedSubCategory,
    };
  }
}
