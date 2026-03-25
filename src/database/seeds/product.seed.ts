import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Product } from "../../products/entity/product.entity";
import { Category } from "../../categories/entity/category.entity";
import { SubCategory } from "../../categories/entity/sub-category.entity";
import { Shop } from "../../shops/entity/shop.entity";
import { faker } from "@faker-js/faker";

export default class CreateProducts implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const productRepo = dataSource.getRepository(Product);
    
    // Get existing categories and shops for relationships
    const categories = await dataSource.getRepository(Category).find();
    const subCategories = await dataSource.getRepository(SubCategory).find();
    const shops = await dataSource.getRepository(Shop).find();

    if (categories.length === 0 || shops.length === 0) {
      return;
    }

    const products: Partial<Product>[] = [];

    // Product name templates for different categories
    const productTemplates = {
      "Electronics": [
        "Wireless Bluetooth Headphones",
        "Smart Watch Pro",
        "Laptop Stand Adjustable",
        "USB-C Hub Multi-Port",
        "Wireless Charging Pad",
        "Portable Power Bank",
        "Webcam HD 1080p",
        "Mechanical Keyboard RGB"
      ],
      "Mobiles & Accessories": [
        "iPhone 15 Pro Case",
        "Samsung Galaxy Screen Protector",
        "Wireless Phone Charger",
        "Phone Ring Holder",
        "Bluetooth Earbuds",
        "Car Phone Mount",
        "Phone Cable USB-C",
        "Wireless Power Bank"
      ],
      "Computers & Laptops": [
        "Gaming Mouse RGB",
        "Laptop Cooling Pad",
        "Monitor Stand Adjustable",
        "External Hard Drive 1TB",
        "Webcam with Microphone",
        "USB Flash Drive 64GB",
        "Laptop Bag Backpack",
        "Wireless Mouse Ergonomic"
      ],
      "Home & Kitchen": [
        "Electric Kettle 1.7L",
        "Blender 500W",
        "Coffee Maker Automatic",
        "Air Fryer 3.5L",
        "Toaster 2-Slice",
        "Mixer Grinder 750W",
        "Induction Cooktop",
        "Water Purifier 7L"
      ],
      "Fashion": [
        "Men's Cotton T-Shirt",
        "Women's Jeans Slim Fit",
        "Leather Wallet",
        "Sunglasses UV Protection",
        "Watch Analog Classic",
        "Belt Genuine Leather",
        "Scarf Wool Blend",
        "Handbag PU Leather"
      ],
      "Beauty & Personal Care": [
        "Face Wash Gel",
        "Moisturizer SPF 30",
        "Lipstick Matte Red",
        "Shampoo Anti-Dandruff",
        "Toothpaste Whitening",
        "Perfume Eau de Parfum",
        "Face Mask Clay",
        "Hair Oil Natural"
      ],
      "Grocery & Gourmet": [
        "Organic Honey 500g",
        "Premium Tea Leaves",
        "Extra Virgin Olive Oil",
        "Basmati Rice 5kg",
        "Coffee Beans Arabica",
        "Dark Chocolate 70%",
        "Spices Mix Combo",
        "Pasta Italian Style"
      ],
      "Sports & Outdoors": [
        "Yoga Mat Non-Slip",
        "Dumbbells Set 5kg",
        "Water Bottle 1L",
        "Running Shoes",
        "Tennis Racket",
        "Fitness Tracker",
        "Camping Tent 2-Person",
        "Bicycle Helmet"
      ]
    };

    // Generate 50 products
    for (let i = 0; i < 50; i++) {
      const category = faker.helpers.arrayElement(categories);
      const subCategory = faker.helpers.arrayElement(subCategories);
      const shop = faker.helpers.arrayElement(shops);
      
      // Get product templates for this category or use generic ones
      const categoryTemplates = productTemplates[category.name as keyof typeof productTemplates] || [
        "Premium Quality Product",
        "Best Seller Item",
        "Limited Edition",
        "Professional Grade",
        "Eco Friendly Option"
      ];
      
      const productName = faker.helpers.arrayElement(categoryTemplates) + ` ${faker.number.int({ min: 1, max: 999 })}`;
      
      const mrp = faker.number.float({ min: 100, max: 10000, fractionDigits: 2 });
      const discountPercentage = faker.number.float({ min: 0, max: 50, fractionDigits: 1 });
      const sellingPrice = mrp * (1 - discountPercentage / 100);

      products.push({
        name: productName,
        description: faker.commerce.productDescription(),
        longDescription: faker.lorem.paragraphs(2),
        mrp: mrp,
        sellingPrice: sellingPrice,
        discountPercentage: discountPercentage,
        stockQuantity: faker.number.int({ min: 10, max: 500 }),
        isAvailable: faker.datatype.boolean({ probability: 0.9 }), // 90% chance of being available
        lowStockThreshold: faker.number.int({ min: 5, max: 20 }),
        unit: faker.helpers.arrayElement(["pcs", "kg", "ltr", "box", "pack"]),
        unitValue: faker.number.int({ min: 1, max: 10 }),
        packSize: faker.helpers.arrayElement(["1pc", "500g", "1ltr", "6pcs", "12pcs"]),
        category: category,
        subCategory: subCategory,
        brand: faker.company.name(),
        isVeg: faker.datatype.boolean(),
        expiryDays: faker.number.int({ min: 30, max: 365 }),
        images: [
          faker.image.url({ width: 640, height: 480 }),
          faker.image.url({ width: 640, height: 480 }),
          faker.image.url({ width: 640, height: 480 })
        ],
        shop: shop
      });
    }

    await productRepo.save(products);
  }
}
