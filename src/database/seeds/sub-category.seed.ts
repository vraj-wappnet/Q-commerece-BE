import { DataSource, In } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Category } from "../../modules/categories/entity/category.entity";
import { SubCategory } from "../../modules/categories/entity/sub-category.entity";

type CategoryName = string;

export default class CreateSubCategories implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const categoryRepo = dataSource.getRepository(Category);
    const subCategoryRepo = dataSource.getRepository(SubCategory);

    const categoryToSubCategories: Record<CategoryName, string[]> = {
      Electronics: ["Televisions", "Cameras"],
      "Mobiles & Accessories": ["Smartphones", "Phone Cases"],
      "Computers & Laptops": ["Laptops", "Computer Accessories"],
      "Home & Kitchen": ["Cookware", "Home Decor"],
      Fashion: ["Men's Clothing", "Women's Clothing"],
      Footwear: ["Men's Footwear", "Women's Footwear"],
      "Beauty & Personal Care": ["Skincare", "Haircare"],
      "Health & Wellness": ["Vitamins & Supplements", "Fitness Equipment"],
      "Grocery & Gourmet": ["Snacks", "Beverages"],
      "Baby Products": ["Diapers", "Baby Care"],
      "Toys & Games": ["Action Figures", "Board Games"],
      "Sports & Outdoors": ["Outdoor Gear", "Sportswear"],
      "Books & Stationery": ["Fiction", "Office Supplies"],
      "Pet Supplies": ["Dog Supplies", "Cat Supplies"],
      Automotive: ["Car Accessories", "Bike Accessories"],
    };

    const categoryNames = Object.keys(categoryToSubCategories);

    // Ensure categories exist (category name is unique).
    const existingCategories = await categoryRepo.find({
      where: { name: In(categoryNames) },
    });

    const existingByName = new Map(existingCategories.map((c) => [c.name, c]));
    const missing = categoryNames.filter((n) => !existingByName.has(n));

    if (missing.length) {
      await categoryRepo
        .createQueryBuilder()
        .insert()
        .into(Category)
        .values(missing.map((name) => ({ name })))
        .orIgnore()
        .execute();
    }

    const categories = await categoryRepo.find({ where: { name: In(categoryNames) } });
    const categoryByName = new Map(categories.map((c) => [c.name, c]));

    // Load existing subcategories for these categories to make this seed idempotent.
    const categoryIds = categories.map((c) => c.id);
    const existingSubs =
      categoryIds.length === 0
        ? []
        : await subCategoryRepo
            .createQueryBuilder("sub")
            .leftJoinAndSelect("sub.category", "category")
            .where("category.id IN (:...ids)", { ids: categoryIds })
            .getMany();

    const existingKey = new Set(
      existingSubs.map(
        (s) => `${s.category?.id}:${(s.name ?? "").trim().toLowerCase()}`,
      ),
    );

    const toCreate: Partial<SubCategory>[] = [];
    for (const [categoryName, subNames] of Object.entries(categoryToSubCategories)) {
      const category = categoryByName.get(categoryName);
      if (!category) continue;

      for (const rawName of subNames) {
        const name = rawName.trim();
        const key = `${category.id}:${name.toLowerCase()}`;
        if (existingKey.has(key)) continue;

        toCreate.push({
          name,
          category,
        });
      }
    }

    if (toCreate.length) {
      await subCategoryRepo.save(toCreate);
    }

  }
}
