import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Category } from "../../categories/entity/category.entity";

export default class CreateCategories implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const categoryRepo = dataSource.getRepository(Category);

    const names = [
      "Electronics",
      "Mobiles & Accessories",
      "Computers & Laptops",
      "Home & Kitchen",
      "Fashion",
      "Footwear",
      "Beauty & Personal Care",
      "Health & Wellness",
      "Grocery & Gourmet",
      "Baby Products",
      "Toys & Games",
      "Sports & Outdoors",
      "Books & Stationery",
      "Pet Supplies",
      "Automotive",
    ];

    await categoryRepo
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values(names.map((name) => ({ name })))
      .orIgnore()
      .execute();

    console.log(`Categories seeded: ${names.length}`);
  }
}
