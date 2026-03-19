import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrderEntity1773903057836 implements MigrationInterface {
    name = 'UpdateOrderEntity1773903057836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "addressLine1" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "addressLine2" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "state" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "country" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "latitude" numeric(10,6)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "longitude" numeric(10,6)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "cancelReason" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "cancelledAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "cancelledAt"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "cancelReason"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "addressLine2"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "addressLine1"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "address" character varying`);
    }

}
