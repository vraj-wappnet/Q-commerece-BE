import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPaymentStatusAndUpdateDecimals1774418906324 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type first
        await queryRunner.query(`
            CREATE TYPE "public"."order_paymentstatus_enum" AS ENUM('1', '2', '3', '4', '5')
        `);

        // Add paymentStatus column to order table with proper enum casting
        await queryRunner.query(`
            ALTER TABLE "order" 
            ADD "paymentStatus" "public"."order_paymentstatus_enum" NOT NULL DEFAULT '1'::"public"."order_paymentstatus_enum"
        `);

        // Update order table decimal columns
        await queryRunner.query(`
            ALTER TABLE "order" 
            ALTER COLUMN "totalAmount" TYPE DECIMAL(10,2)
        `);

        await queryRunner.query(`
            ALTER TABLE "order" 
            ALTER COLUMN "deliveryCharge" TYPE DECIMAL(10,2)
        `);

        // Update order_item table decimal columns
        await queryRunner.query(`
            ALTER TABLE "order_item" 
            ALTER COLUMN "price" TYPE DECIMAL(10,2)
        `);

        await queryRunner.query(`
            ALTER TABLE "order_item" 
            ALTER COLUMN "totalPrice" TYPE DECIMAL(10,2)
        `);

        // Update cart table decimal columns
        await queryRunner.query(`
            ALTER TABLE "cart" 
            ALTER COLUMN "totalAmount" TYPE DECIMAL(10,2)
        `);

        // Update cart_item table decimal columns
        await queryRunner.query(`
            ALTER TABLE "cart_item" 
            ALTER COLUMN "price" TYPE DECIMAL(10,2)
        `);

        await queryRunner.query(`
            ALTER TABLE "cart_item" 
            ALTER COLUMN "totalPrice" TYPE DECIMAL(10,2)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove paymentStatus column
        await queryRunner.query(`
            ALTER TABLE "order" 
            DROP COLUMN "paymentStatus"
        `);

        // Drop enum type
        await queryRunner.query(`
            DROP TYPE "public"."order_paymentstatus_enum"
        `);

        // Revert order table columns
        await queryRunner.query(`
            ALTER TABLE "order" 
            ALTER COLUMN "totalAmount" TYPE DECIMAL
        `);

        await queryRunner.query(`
            ALTER TABLE "order" 
            ALTER COLUMN "deliveryCharge" TYPE DECIMAL
        `);

        // Revert order_item table columns
        await queryRunner.query(`
            ALTER TABLE "order_item" 
            ALTER COLUMN "price" TYPE DECIMAL
        `);

        await queryRunner.query(`
            ALTER TABLE "order_item" 
            ALTER COLUMN "totalPrice" TYPE DECIMAL
        `);

        // Revert cart table columns
        await queryRunner.query(`
            ALTER TABLE "cart" 
            ALTER COLUMN "totalAmount" TYPE DECIMAL
        `);

        // Revert cart_item table columns
        await queryRunner.query(`
            ALTER TABLE "cart_item" 
            ALTER COLUMN "price" TYPE DECIMAL
        `);

        await queryRunner.query(`
            ALTER TABLE "cart_item" 
            ALTER COLUMN "totalPrice" TYPE DECIMAL
        `);
    }
}
