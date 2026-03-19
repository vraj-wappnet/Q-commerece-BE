import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAndShopEntities1773903291402 implements MigrationInterface {
    name = 'UpdateUserAndShopEntities1773903291402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "shopLicense"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "vehicleType"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "vehicleName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "drivingLicense"`);
        await queryRunner.query(`ALTER TABLE "shop" ADD "shopLicense" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop" DROP COLUMN "shopLicense"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "drivingLicense" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "vehicleName" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "vehicleType" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "shopLicense" character varying`);
    }

}
