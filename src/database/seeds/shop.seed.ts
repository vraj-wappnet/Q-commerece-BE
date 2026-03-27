import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Shop } from "../../modules/shops/entity/shop.entity";
import { User } from "../../modules/auth/entity/user.entity";
import { Role } from "../../modules/roles-permission/entity/roles.entity";
import { faker } from "@faker-js/faker";

export default class CreateShops implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const shopRepo = dataSource.getRepository(Shop);
    const userRepo = dataSource.getRepository(User);

    // Get existing sellers
    const sellerRole = await dataSource.getRepository(Role).findOne({ where: { name: 'SELLER' } });
    const sellers = await userRepo.find({
      where: { role: sellerRole!, isVerified: true, adminApproved: true }
    });

    // Get existing shops to avoid duplicates
    const existingShops = await shopRepo.find({ relations: ['seller'] });
    const existingSellerIds = existingShops.map(shop => shop.seller?.id).filter(Boolean);

    if (sellers.length === 0) {
      console.log('No sellers found. Please run user seeder first.');
      return;
    }

    // Filter sellers who don't have shops yet
    const availableSellers = sellers.filter(seller => !existingSellerIds.includes(seller.id));

    if (availableSellers.length === 0) {
      console.log('All sellers already have shops.');
      return;
    }

    // Predefined shop names for variety
    const shopNames = [
      "Fresh Mart Grocery",
      "Green Valley Organics",
      "Daily Needs Store",
      "Quick Stop Supermarket",
      "Urban Bazaar",
      "Healthy Harvest",
      "Corner Store Express",
      "Prime Provisions",
      "Smart Shop",
      "Neighborhood Grocers",
      "Fresh & Fast Market",
      "City Center Store"
    ];

    const shops: Partial<Shop>[] = [];

    // Create shops for available sellers (up to 12)
    const shopsToCreate = Math.min(availableSellers.length, 12);
    
    for (let i = 0; i < shopsToCreate; i++) {
      const seller = availableSellers[i];
      const shopIndex = existingShops.length + i;
      
      shops.push({
        shopName: shopNames[shopIndex % shopNames.length] || `${faker.company.name()} Store`,
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        pinCode: faker.location.zipCode('######'),
        country: "India",
        pickupAddress: faker.location.streetAddress(),
        shopLicense: `https://res.cloudinary.com/demo/shop-license-${shopIndex + 1}.pdf`,
        gstNumber: `27AAAPL1234C${faker.string.alphanumeric(5).toUpperCase()}`,
        panNumber: faker.string.alphanumeric(10).toUpperCase(),
        businessRegistrationNumber: `UDYAM-${faker.location.state().substring(0, 3)}-${faker.number.int({ min: 1000000, max: 9999999 })}`,
        fssaiNumber: `${faker.number.int({ min: 100, max: 999 })}${faker.location.state().substring(0, 3).toUpperCase()}${faker.number.int({ min: 10000000000, max: 99999999999 })}`,
        accountHolderName: `${seller.firstName} ${seller.lastName}`,
        accountNumber: faker.finance.accountNumber(),
        ifscCode: `${faker.string.alpha(4).toUpperCase()}0${faker.location.state().substring(0, 3).toUpperCase()}0${faker.number.int({ min: 100, max: 999 })}`,
        bankName: faker.company.name(),
        cancelledChequeImage: `https://res.cloudinary.com/demo/cheque-${shopIndex + 1}.jpg`,
        alternatePhone: faker.phone.number(),
        whatsappNumber: faker.phone.number(),
        websiteUrl: faker.internet.url(),
        instagram: `@${faker.internet.displayName().replace(/\s+/g, '').toLowerCase()}`,
        facebook: faker.internet.url(),
        seller: seller
      });
    }

    if (shops.length > 0) {
      await shopRepo.save(shops);
      console.log(`Successfully created ${shops.length} new shops`);
    }
  }
}
