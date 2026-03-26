import { Category } from "../entity/category.entity";
import { SubCategory } from "../entity/sub-category.entity";
import { CategoryVm, SubCategoryVm, CategorySummaryVm, SubCategorySummaryVm } from "../vm/categories.vm";

export class CategoriesMapper {
  static toSubCategoryVm(subCategory: SubCategory): SubCategoryVm {
    return {
      id: subCategory.id,
      name: subCategory.name,
      category: subCategory.category ? {
        id: subCategory.category.id,
        name: subCategory.category.name,
      } : undefined,
      createdAt: subCategory.createdAt,
      updatedAt: subCategory.updatedAt,
    };
  }

  static toCategoryVm(category: Category): CategoryVm {
    return {
      id: category.id,
      name: category.name,
      subCategories: category.subCategories ? 
        category.subCategories.map(sub => this.toSubCategoryVm(sub)) : [],
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toCategorySummaryVm(category: Category): CategorySummaryVm {
    return {
      id: category.id,
      name: category.name,
      subCategoryCount: category.subCategories ? category.subCategories.length : 0,
    };
  }

  static toSubCategorySummaryVm(subCategory: SubCategory): SubCategorySummaryVm {
    return {
      id: subCategory.id,
      name: subCategory.name,
      categoryName: subCategory.category ? subCategory.category.name : 'Unknown',
    };
  }

  static toCategoryVmList(categories: Category[]): CategoryVm[] {
    return categories.map(category => this.toCategoryVm(category));
  }

  static toSubCategoryVmList(subCategories: SubCategory[]): SubCategoryVm[] {
    return subCategories.map(subCategory => this.toSubCategoryVm(subCategory));
  }

  static toCategorySummaryVmList(categories: Category[]): CategorySummaryVm[] {
    return categories.map(category => this.toCategorySummaryVm(category));
  }

  static toSubCategorySummaryVmList(subCategories: SubCategory[]): SubCategorySummaryVm[] {
    return subCategories.map(subCategory => this.toSubCategorySummaryVm(subCategory));
  }
}
