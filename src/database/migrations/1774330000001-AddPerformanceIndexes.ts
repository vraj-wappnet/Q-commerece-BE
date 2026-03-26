import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPerformanceIndexes1774330000001 implements MigrationInterface {
    name = 'AddPerformanceIndexes1774330000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ORDER TABLE INDEXES
        await queryRunner.query(`
            CREATE INDEX "idx_order_user_created" ON "order" ("userId", "createdAt")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "idx_order_status" ON "order" ("status")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "idx_order_payment_status" ON "order" ("paymentStatus")
        `);

        // DELIVERY ASSIGNMENT TABLE INDEXES
        await queryRunner.query(`
            CREATE INDEX "idx_delivery_assignment_main" ON "delivery_assignments" ("orderId", "userId", "status")
        `);

        // DELIVERY PROFILE TABLE INDEXES
        await queryRunner.query(`
            CREATE INDEX "idx_delivery_available" ON "delivery_profile" ("isAvailable")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "idx_delivery_location" ON "delivery_profile" ("latitude", "longitude")
        `);

        // CART TABLE INDEXES
        await queryRunner.query(`
            CREATE INDEX "idx_cart_user_active" ON "cart" ("userId", "isActive")
        `);

        // ORDER ITEMS TABLE INDEXES
        await queryRunner.query(`
            CREATE INDEX "idx_order_item_order" ON "order_item" ("orderId")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "idx_order_item_product" ON "order_item" ("productId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // ORDER TABLE INDEXES
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_order_user_created"
        `);
        
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_order_status"
        `);
        
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_order_payment_status"
        `);

        // DELIVERY ASSIGNMENT TABLE INDEXES
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_delivery_assignment_main"
        `);

        // DELIVERY PROFILE TABLE INDEXES
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_delivery_available"
        `);
        
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_delivery_location"
        `);

        // CART TABLE INDEXES
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_cart_user_active"
        `);

        // ORDER ITEMS TABLE INDEXES
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_order_item_order"
        `);
        
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_order_item_product"
        `);
    }
}
