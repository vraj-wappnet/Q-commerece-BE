import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrderAndDeliveryProfileFields1773915757270 implements MigrationInterface {
    name = 'UpdateOrderAndDeliveryProfileFields1773915757270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "pincode" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "assignedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "deliveryPersonId" uuid`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "latitude" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "longitude" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ALTER COLUMN "latitude" TYPE numeric(10,6)`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ALTER COLUMN "latitude" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ALTER COLUMN "longitude" TYPE numeric(10,6)`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ALTER COLUMN "longitude" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_1e808bbe959a8807b2cce4a461f" FOREIGN KEY ("deliveryPersonId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_1e808bbe959a8807b2cce4a461f"`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ALTER COLUMN "longitude" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ALTER COLUMN "longitude" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ALTER COLUMN "latitude" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ALTER COLUMN "latitude" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "longitude" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "latitude" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "deliveryPersonId"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "assignedAt"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "pincode"`);
    }

}
