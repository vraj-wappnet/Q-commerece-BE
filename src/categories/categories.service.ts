import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entity/category.entity";
import { SubCategory } from "./entity/sub-category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateSubCategoryDto } from "./dto/create-subcategory.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateSubCategoryDto } from "./dto/update-subcategory.dto";
import { Product } from "src/products/entity/product.entity";

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

  async getAll() {
    return this.categoryRepo.find({
      order: { name: "ASC" },
      relations: ["subCategories"],
    });
  }

  async getAllSubCategories() {
    return this.subCategoryRepo.find({
      order: { name: "ASC" },
      relations: ["category"],
    });
  }

  async getSubCategoriesByCategory(categoryId: string) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new BadRequestException("Category not found");

    return this.subCategoryRepo.find({
      where: { category: { id: categoryId } },
      order: { name: "ASC" },
      relations: ["category"],
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    const existing = await this.categoryRepo.findOne({ where: { name } });
    if (existing) {
      throw new BadRequestException("Category already exists");
    }

    const category = this.categoryRepo.create({ name });
    return this.categoryRepo.save(category);
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
    return { message: "Category deleted successfully" };
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
    return this.subCategoryRepo.save(sub);
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
    return { message: "SubCategory deleted successfully" };
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
    return this.categoryRepo.findOne({
      where: { id },
      relations: ["subCategories"],
    });
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
    return this.subCategoryRepo.findOne({
      where: { id },
      relations: ["category"],
    });
  }
}
