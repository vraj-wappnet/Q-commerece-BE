import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSomething1773813333978 implements MigrationInterface {
    name = 'CreateSomething1773813333978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "longDescription" text, "mrp" numeric NOT NULL, "sellingPrice" numeric NOT NULL, "discountPercentage" numeric, "stockQuantity" integer NOT NULL, "isAvailable" boolean NOT NULL DEFAULT true, "lowStockThreshold" integer, "unit" character varying NOT NULL, "unitValue" integer, "packSize" character varying, "category" character varying NOT NULL, "subCategory" character varying, "brand" character varying, "isVeg" boolean NOT NULL, "expiryDays" integer, "images" text array, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "shopId" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shop" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_1c4b1934c3e8c5b69b3d3d311d6" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_1c4b1934c3e8c5b69b3d3d311d6"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP COLUMN "createdAt"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
