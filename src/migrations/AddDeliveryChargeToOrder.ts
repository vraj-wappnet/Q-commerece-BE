import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryChargeToOrder implements MigrationInterface {
    name = 'AddDeliveryChargeToOrder'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order" 
            ADD COLUMN "deliveryCharge" numeric(10,2) NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order" 
            DROP COLUMN "deliveryCharge"
        `);
    }
}
