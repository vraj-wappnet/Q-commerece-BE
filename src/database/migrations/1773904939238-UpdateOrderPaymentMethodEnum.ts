import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrderPaymentMethodEnum1773904939238 implements MigrationInterface {
    name = 'UpdateOrderPaymentMethodEnum1773904939238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "paymentMethod"`);
        await queryRunner.query(`CREATE TYPE "public"."order_paymentmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`ALTER TABLE "order" ADD "paymentMethod" "public"."order_paymentmethod_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "paymentMethod"`);
        await queryRunner.query(`DROP TYPE "public"."order_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "paymentMethod" character varying`);
    }

}
