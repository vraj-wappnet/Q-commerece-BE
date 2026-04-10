import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialCreateTables1773063087617 implements MigrationInterface {
    name = 'InitialCreateTables1773063087617'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "mobile" character varying NOT NULL, "isVerified" boolean NOT NULL DEFAULT false, "adminApproved" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "roleId" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_29fd51e9cf9241d022c5a4e02e6" UNIQUE ("mobile"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "otp" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sub_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" uuid, CONSTRAINT "PK_59f4461923255f1ce7fc5e7423c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "longDescription" text, "mrp" numeric NOT NULL, "sellingPrice" numeric NOT NULL, "discountPercentage" numeric, "stockQuantity" integer NOT NULL, "isAvailable" boolean NOT NULL DEFAULT true, "lowStockThreshold" integer, "unit" character varying NOT NULL, "unitValue" integer, "packSize" character varying, "brand" character varying, "isVeg" boolean NOT NULL, "expiryDays" integer, "images" text array, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" uuid, "subCategoryId" uuid, "shopId" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shop" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "shopName" character varying NOT NULL, "addressLine1" character varying NOT NULL, "addressLine2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "pinCode" character varying NOT NULL, "country" character varying NOT NULL DEFAULT 'India', "pickupAddress" character varying, "shopLicense" character varying, "gstNumber" character varying NOT NULL, "panNumber" character varying NOT NULL, "businessRegistrationNumber" character varying, "fssaiNumber" character varying, "accountHolderName" character varying NOT NULL, "accountNumber" character varying NOT NULL, "ifscCode" character varying NOT NULL, "bankName" character varying NOT NULL, "cancelledChequeImage" character varying, "alternatePhone" character varying, "whatsappNumber" character varying, "websiteUrl" character varying, "instagram" character varying, "facebook" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "sellerId" uuid, CONSTRAINT "REL_093e18620bef436b3a6ac05fb8" UNIQUE ("sellerId"), CONSTRAINT "PK_ad47b7c6121fe31cb4b05438e44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart" ("id" SERIAL NOT NULL, "totalAmount" numeric(10,2) NOT NULL DEFAULT '0', "totalItems" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_756f53ab9466eb52a52619ee01" UNIQUE ("userId"), CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9b1f629c67f2d16e87a5f94a9f" ON "cart" ("userId", "isActive") `);
        await queryRunner.query(`CREATE TABLE "cart_item" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cartId" integer, "productId" uuid, CONSTRAINT "PK_bd94725aa84f8cf37632bcde997" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_item" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "orderId" uuid, "productId" uuid, CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_904370c093ceea4369659a3c81" ON "order_item" ("productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_646bf9ece6f45dbe41c203e06e" ON "order_item" ("orderId") `);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('1', '2', '3', '4', '5', '6', '7')`);
        await queryRunner.query(`CREATE TYPE "public"."order_paymentmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TYPE "public"."order_paymentstatus_enum" AS ENUM('1', '2', '3', '4', '5')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalAmount" numeric(10,2) NOT NULL, "deliveryCharge" numeric(10,2) NOT NULL DEFAULT '0', "totalItems" integer NOT NULL, "status" "public"."order_status_enum" NOT NULL DEFAULT '1', "paymentMethod" "public"."order_paymentmethod_enum", "paymentStatus" "public"."order_paymentstatus_enum" NOT NULL DEFAULT '1', "addressLine1" character varying, "addressLine2" character varying, "city" character varying, "state" character varying, "country" character varying, "pincode" character varying, "latitude" numeric(10,6) NOT NULL, "longitude" numeric(10,6) NOT NULL, "isPaid" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cancelReason" character varying, "cancelledAt" TIMESTAMP, "assignedAt" TIMESTAMP, "userId" uuid, "deliveryPersonId" uuid, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3995ab3a03cf2b54b0999f75a3" ON "order" ("paymentStatus") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a9573d6a1fb982772a9123320" ON "order" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_4a9f01c8d132a255d61263d52e" ON "order" ("userId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "delivery_profile" ("id" SERIAL NOT NULL, "vehicleType" character varying NOT NULL, "vehicleName" character varying NOT NULL, "rcBookPhoto" character varying NOT NULL, "licensePhoto" character varying NOT NULL, "addressLine1" character varying NOT NULL, "addressLine2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "pincode" character varying NOT NULL, "location" character varying, "latitude" numeric(10,6) NOT NULL, "longitude" numeric(10,6) NOT NULL, "isAvailable" boolean DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_46eec824b778f53970d60c9a8a" UNIQUE ("userId"), CONSTRAINT "PK_ab96c2d858fbead971327377abd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3c8de2fbc42f8c74f8751321bf" ON "delivery_profile" ("latitude", "longitude") `);
        await queryRunner.query(`CREATE INDEX "IDX_6871b43da89c56968f1d7470a5" ON "delivery_profile" ("isAvailable") `);
        await queryRunner.query(`CREATE TYPE "public"."delivery_assignments_status_enum" AS ENUM('1', '2', '3', '4')`);
        await queryRunner.query(`CREATE TABLE "delivery_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."delivery_assignments_status_enum" NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "orderId" uuid, "userId" uuid, CONSTRAINT "PK_d1cfabf26db04a5282217fb7b83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b2d172fadfc9c5d0098128bcae" ON "delivery_assignments" ("userId", "orderId", "status") `);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('1', '2', '3')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "message" character varying NOT NULL, "type" "public"."notification_type_enum" NOT NULL, "isRead" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("roleid" integer NOT NULL, "permissionid" integer NOT NULL, CONSTRAINT "PK_157845fadb6e826740adf949f56" PRIMARY KEY ("roleid", "permissionid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_054b3d34a294e692a75623468c" ON "role_permissions" ("roleid") `);
        await queryRunner.query(`CREATE INDEX "IDX_436da822070e266920ee55184d" ON "role_permissions" ("permissionid") `);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_category" ADD CONSTRAINT "FK_51b8c0b349725210c4bd8b9b7a7" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_ff0c0301a95e517153df97f6812" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_463d24f6d4905c488bd509164e6" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_1c4b1934c3e8c5b69b3d3d311d6" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop" ADD CONSTRAINT "FK_093e18620bef436b3a6ac05fb89" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_756f53ab9466eb52a52619ee019" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_29e590514f9941296f3a2440d39" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_75db0de134fe0f9fe9e4591b7bf" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_904370c093ceea4369659a3c810" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_1e808bbe959a8807b2cce4a461f" FOREIGN KEY ("deliveryPersonId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ADD CONSTRAINT "FK_46eec824b778f53970d60c9a8ac" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_assignments" ADD CONSTRAINT "FK_7087f6eb93590acbb62ed7ab85a" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_assignments" ADD CONSTRAINT "FK_095f7ca9c4f55ee87e96ef70cbe" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_054b3d34a294e692a75623468c8" FOREIGN KEY ("roleid") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_436da822070e266920ee55184d8" FOREIGN KEY ("permissionid") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_436da822070e266920ee55184d8"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_054b3d34a294e692a75623468c8"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`ALTER TABLE "delivery_assignments" DROP CONSTRAINT "FK_095f7ca9c4f55ee87e96ef70cbe"`);
        await queryRunner.query(`ALTER TABLE "delivery_assignments" DROP CONSTRAINT "FK_7087f6eb93590acbb62ed7ab85a"`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" DROP CONSTRAINT "FK_46eec824b778f53970d60c9a8ac"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_1e808bbe959a8807b2cce4a461f"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_904370c093ceea4369659a3c810"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_75db0de134fe0f9fe9e4591b7bf"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_29e590514f9941296f3a2440d39"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_756f53ab9466eb52a52619ee019"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_093e18620bef436b3a6ac05fb89"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_1c4b1934c3e8c5b69b3d3d311d6"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_463d24f6d4905c488bd509164e6"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_ff0c0301a95e517153df97f6812"`);
        await queryRunner.query(`ALTER TABLE "sub_category" DROP CONSTRAINT "FK_51b8c0b349725210c4bd8b9b7a7"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_436da822070e266920ee55184d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_054b3d34a294e692a75623468c"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2d172fadfc9c5d0098128bcae"`);
        await queryRunner.query(`DROP TABLE "delivery_assignments"`);
        await queryRunner.query(`DROP TYPE "public"."delivery_assignments_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6871b43da89c56968f1d7470a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c8de2fbc42f8c74f8751321bf"`);
        await queryRunner.query(`DROP TABLE "delivery_profile"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4a9f01c8d132a255d61263d52e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a9573d6a1fb982772a9123320"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3995ab3a03cf2b54b0999f75a3"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_paymentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_paymentmethod_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_646bf9ece6f45dbe41c203e06e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_904370c093ceea4369659a3c81"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`DROP TABLE "cart_item"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b1f629c67f2d16e87a5f94a9f"`);
        await queryRunner.query(`DROP TABLE "cart"`);
        await queryRunner.query(`DROP TABLE "shop"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "sub_category"`);
        await queryRunner.query(`DROP TABLE "otp"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
    }

}
