import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeOrderIdToUuid1774420000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️  WARNING: This migration will delete all existing orders and related data!');
        
        // Check which tables exist
        const deliveryAssignmentExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'delivery_assignment'
            )
        `);
        
        const deliveryAssignmentsExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'delivery_assignments'
            )
        `);
        
        // Drop all foreign key constraints
        await queryRunner.query(`ALTER TABLE "payment_transactions" DROP CONSTRAINT IF EXISTS "FK_5b3faf4bb5e17cf8fd691bf9512"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT IF EXISTS "FK_646bf9ece6f45dbe41c203e06e0"`);
        
        if (deliveryAssignmentExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "delivery_assignment" DROP CONSTRAINT IF EXISTS "FK_delivery_assignment_order"`);
        }
        
        if (deliveryAssignmentsExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "delivery_assignments" DROP CONSTRAINT IF EXISTS "FK_7087f6eb93590acbb62ed7ab85a"`);
        }
        
        // Delete all data from related tables
        await queryRunner.query(`DELETE FROM "payment_transactions"`);
        await queryRunner.query(`DELETE FROM "order_item"`);
        
        if (deliveryAssignmentExists[0].exists) {
            await queryRunner.query(`DELETE FROM "delivery_assignment"`);
        }
        
        if (deliveryAssignmentsExists[0].exists) {
            await queryRunner.query(`DELETE FROM "delivery_assignments"`);
        }
        
        await queryRunner.query(`DELETE FROM "order"`);
        
        // Drop the old primary key
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "PK_1031171c13130102495201e3e20"`);
        
        // Drop the old id column
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "id"`);
        
        // Add new UUID id column
        await queryRunner.query(`ALTER TABLE "order" ADD COLUMN "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY`);
        
        // Update foreign key columns to UUID
        await queryRunner.query(`ALTER TABLE "payment_transactions" ALTER COLUMN "orderId" TYPE uuid USING uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "order_item" ALTER COLUMN "orderId" TYPE uuid USING uuid_generate_v4()`);
        
        if (deliveryAssignmentExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "delivery_assignment" ALTER COLUMN "orderId" TYPE uuid USING uuid_generate_v4()`);
        }
        
        if (deliveryAssignmentsExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "delivery_assignments" ALTER COLUMN "orderId" TYPE uuid USING uuid_generate_v4()`);
        }
        
        // Recreate foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "payment_transactions" 
            ADD CONSTRAINT "FK_5b3faf4bb5e17cf8fd691bf9512" 
            FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE
        `);
        
        await queryRunner.query(`
            ALTER TABLE "order_item" 
            ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" 
            FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE
        `);
        
        if (deliveryAssignmentExists[0].exists) {
            await queryRunner.query(`
                ALTER TABLE "delivery_assignment" 
                ADD CONSTRAINT "FK_delivery_assignment_order" 
                FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE
            `);
        }
        
        if (deliveryAssignmentsExists[0].exists) {
            await queryRunner.query(`
                ALTER TABLE "delivery_assignments" 
                ADD CONSTRAINT "FK_7087f6eb93590acbb62ed7ab85a" 
                FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE
            `);
        }
        
        console.log('✅ Successfully migrated Order ID to UUID');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️  WARNING: Rolling back will delete all existing orders and related data!');
        
        const deliveryAssignmentExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'delivery_assignment'
            )
        `);
        
        const deliveryAssignmentsExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'delivery_assignments'
            )
        `);
        
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "payment_transactions" DROP CONSTRAINT IF EXISTS "FK_5b3faf4bb5e17cf8fd691bf9512"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT IF EXISTS "FK_646bf9ece6f45dbe41c203e06e0"`);
        
        if (deliveryAssignmentExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "delivery_assignment" DROP CONSTRAINT IF EXISTS "FK_delivery_assignment_order"`);
        }
        
        if (deliveryAssignmentsExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "delivery_assignments" DROP CONSTRAINT IF EXISTS "FK_7087f6eb93590acbb62ed7ab85a"`);
        }
        
        // Delete all data
        await queryRunner.query(`DELETE FROM "payment_transactions"`);
        await queryRunner.query(`DELETE FROM "order_item"`);
        
        if (deliveryAssignmentExists[0].exists) {
            await queryRunner.query(`DELETE FROM "delivery_assignment"`);
        }
        
        if (deliveryAssignmentsExists[0].exists) {
            await queryRunner.query(`DELETE FROM "delivery_assignments"`);
        }
        
        await queryRunner.query(`DELETE FROM "order"`);
        
        // Drop UUID column
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "id"`);
        
        // Add integer id column
        await queryRunner.query(`ALTER TABLE "order" ADD COLUMN "id" SERIAL PRIMARY KEY`);
        
        // Convert foreign key columns back to integer
        await queryRunner.query(`ALTER TABLE "payment_transactions" ALTER COLUMN "orderId" TYPE int USING 1`);
        await queryRunner.query(`ALTER TABLE "order_item" ALTER COLUMN "orderId" TYPE int USING 1`);
        
        if (deliveryAssignmentExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "delivery_assignment" ALTER COLUMN "orderId" TYPE int USING 1`);
        }
        
        if (deliveryAssignmentsExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "delivery_assignments" ALTER COLUMN "orderId" TYPE int USING 1`);
        }
        
        // Recreate foreign keys
        await queryRunner.query(`
            ALTER TABLE "payment_transactions" 
            ADD CONSTRAINT "FK_5b3faf4bb5e17cf8fd691bf9512" 
            FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE
        `);
        
        await queryRunner.query(`
            ALTER TABLE "order_item" 
            ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" 
            FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE
        `);
        
        if (deliveryAssignmentExists[0].exists) {
            await queryRunner.query(`
                ALTER TABLE "delivery_assignment" 
                ADD CONSTRAINT "FK_delivery_assignment_order" 
                FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE
            `);
        }
        
        if (deliveryAssignmentsExists[0].exists) {
            await queryRunner.query(`
                ALTER TABLE "delivery_assignments" 
                ADD CONSTRAINT "FK_7087f6eb93590acbb62ed7ab85a" 
                FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE
            `);
        }
        
        console.log('✅ Successfully rolled back to integer ID');
    }
}
