import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrdersTable1773899044092 implements MigrationInterface {
    name = 'CreateOrdersTable1773899044092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_category" DROP CONSTRAINT "FK_sub_category_category"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_category"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_sub_category"`);
        await queryRunner.query(`ALTER TABLE "sub_category" ADD CONSTRAINT "FK_51b8c0b349725210c4bd8b9b7a7" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_ff0c0301a95e517153df97f6812" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_463d24f6d4905c488bd509164e6" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_463d24f6d4905c488bd509164e6"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_ff0c0301a95e517153df97f6812"`);
        await queryRunner.query(`ALTER TABLE "sub_category" DROP CONSTRAINT "FK_51b8c0b349725210c4bd8b9b7a7"`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_product_sub_category" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_product_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_category" ADD CONSTRAINT "FK_sub_category_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
