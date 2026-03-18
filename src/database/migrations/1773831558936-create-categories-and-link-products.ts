import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoriesAndLinkProducts1773831558936
  implements MigrationInterface
{
  name = "CreateCategoriesAndLinkProducts1773831558936";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_category_name" UNIQUE ("name"), CONSTRAINT "PK_category_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sub_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" uuid, CONSTRAINT "PK_sub_category_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_category" ADD CONSTRAINT "FK_sub_category_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "category"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "subCategory"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "categoryId" uuid`);
    await queryRunner.query(`ALTER TABLE "product" ADD "subCategoryId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_product_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_product_sub_category" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_product_sub_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_product_category"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "subCategoryId"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "categoryId"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "subCategory" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "category" character varying NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "sub_category" DROP CONSTRAINT "FK_sub_category_category"`,
    );
    await queryRunner.query(`DROP TABLE "sub_category"`);
    await queryRunner.query(`DROP TABLE "category"`);
  }
}

