import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { User } from "../../auth/entity/user.entity";
import { UserRole } from "../../common/enum/roles.enum";
import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

export default class CreateUsers implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userRepo = dataSource.getRepository(User);

    const password = await bcrypt.hash("Password@123", 10);

    const rolesArray = [UserRole.CUSTOMER, UserRole.DELIVERY, UserRole.SELLER];

    const users: Partial<User>[] = [];

    for (let i = 1; i <= 20; i++) {
      const role = rolesArray[i % rolesArray.length];
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      users.push({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@yopmail.com`,
        mobile: faker.string.numeric(10),
        password: password,
        role: role,
        isVerified: true,
        adminApproved: false,
      });
    }

    await userRepo.save(users);
    console.log("20 Users Seeded Successfully");
  }
}
