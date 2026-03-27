import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { User } from "../../modules/auth/entity/user.entity";
import { Role } from "../../modules/roles-permission/entity/roles.entity";
import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

export default class CreateUsers implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userRepo = dataSource.getRepository(User);

    const password = await bcrypt.hash("Password@123", 10);

    // Get existing sellers count
    const sellerRole = await dataSource.getRepository(Role).findOne({ where: { name: 'SELLER' } });
    const customerRole = await dataSource.getRepository(Role).findOne({ where: { name: 'CUSTOMER' } });
    const deliveryRole = await dataSource.getRepository(Role).findOne({ where: { name: 'DELIVERY' } });
    
    const existingSellersCount = await userRepo.count({
      where: { role: sellerRole!, isVerified: true, adminApproved: true }
    });

    const users: Partial<User>[] = [];

    // Create 12 approved sellers for shops (only if we have less than 12)
    const sellersToCreate = Math.max(0, 12 - existingSellersCount);
    
    for (let i = 1; i <= sellersToCreate; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const timestamp = Date.now();

      users.push({
        firstName,
        lastName,
        email: `seller${timestamp}${i}@yopmail.com`,
        mobile: faker.string.numeric(10),
        password: password,
        role: sellerRole!,
        isVerified: true,
        adminApproved: true,
      });
    }

    // Create 5 customers
    for (let i = 1; i <= 5; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const timestamp = Date.now();

      users.push({
        firstName,
        lastName,
        email: `customer${timestamp}${i}@yopmail.com`,
        mobile: faker.string.numeric(10),
        password: password,
        role: customerRole!,
        isVerified: true,
        adminApproved: true,
      });
    }

    // Create 5 delivery persons
    for (let i = 1; i <= 5; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const timestamp = Date.now();

      users.push({
        firstName,
        lastName,
        email: `delivery${timestamp}${i}@yopmail.com`,
        mobile: faker.string.numeric(10),
        password: password,
        role: deliveryRole!,
        isVerified: true,
        adminApproved: true,
      });
    }

    if (users.length > 0) {
      await userRepo.save(users);
      console.log(`Created ${sellersToCreate} new sellers, 5 customers, and 5 delivery persons`);
    } else {
      console.log('Already have 12 or more sellers. No new users created.');
    }
  }
}
