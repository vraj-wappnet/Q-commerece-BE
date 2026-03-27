import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleIdToUser1774520000000 implements MigrationInterface {
    name = 'AddRoleIdToUser1774520000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if roleId column already exists
        const roleIdExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='user' AND column_name='roleId'
        `);

        if (roleIdExists.length === 0) {
            // Add roleId column to user table
            await queryRunner.query(`
                ALTER TABLE "user" 
                ADD COLUMN "roleId" INTEGER
            `);

            // Add foreign key constraint
            await queryRunner.query(`
                ALTER TABLE "user" 
                ADD CONSTRAINT "FK_user_role" 
                FOREIGN KEY ("roleId") 
                REFERENCES "roles"("id") 
                ON DELETE SET NULL 
                ON UPDATE CASCADE
            `);

            // Create index for better performance
            await queryRunner.query(`
                CREATE INDEX "IDX_user_roleId" ON "user" ("roleId")
            `);
        }

        // Check if old role column exists
        const oldRoleExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='user' AND column_name='role'
        `);

        if (oldRoleExists.length > 0) {
            // Migrate data from old role column to new roleId column
            // Old role values: 1=ADMIN, 2=SELLER, 3=DELIVERY, 4=CUSTOMER
            // New roles table: 1=ADMIN, 2=SELLER, 3=CUSTOMER, 4=DELIVERY
            await queryRunner.query(`
                UPDATE "user" 
                SET "roleId" = CASE 
                    WHEN "role" = 1 THEN (SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1)
                    WHEN "role" = 2 THEN (SELECT id FROM roles WHERE name = 'SELLER' LIMIT 1)
                    WHEN "role" = 3 THEN (SELECT id FROM roles WHERE name = 'DELIVERY' LIMIT 1)
                    WHEN "role" = 4 THEN (SELECT id FROM roles WHERE name = 'CUSTOMER' LIMIT 1)
                    ELSE (SELECT id FROM roles WHERE name = 'CUSTOMER' LIMIT 1)
                END
                WHERE "roleId" IS NULL
            `);

            // Drop the old role column
            await queryRunner.query(`
                ALTER TABLE "user" 
                DROP COLUMN "role"
            `);
        } else {
            // If old role column doesn't exist, set default role for users without roleId
            await queryRunner.query(`
                UPDATE "user" 
                SET "roleId" = (SELECT id FROM roles WHERE name = 'CUSTOMER' LIMIT 1)
                WHERE "roleId" IS NULL
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restore old role column
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD COLUMN "role" SMALLINT
        `);

        // Migrate data back from roleId to role
        await queryRunner.query(`
            UPDATE "user" u
            SET "role" = CASE r.name
                WHEN 'ADMIN' THEN 1
                WHEN 'SELLER' THEN 2
                WHEN 'DELIVERY' THEN 3
                WHEN 'CUSTOMER' THEN 4
                ELSE 4
            END
            FROM roles r
            WHERE u."roleId" = r.id
        `);

        // Drop index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_roleId"`);
        
        // Drop foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "user" 
            DROP CONSTRAINT IF EXISTS "FK_user_role"
        `);
        
        // Drop roleId column
        await queryRunner.query(`
            ALTER TABLE "user" 
            DROP COLUMN IF EXISTS "roleId"
        `);
    }
}
