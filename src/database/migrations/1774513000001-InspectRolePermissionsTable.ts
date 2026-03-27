import { MigrationInterface, QueryRunner } from "typeorm";

export class InspectRolePermissionsTable1774513000001 implements MigrationInterface {
    name = 'InspectRolePermissionsTable1774513000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Let's see what columns actually exist in the role_permissions table
        const tableInfo = await queryRunner.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'role_permissions' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        
        console.log('Role permissions table structure:', tableInfo);
        
        // Also check the actual table structure
        const createTableSQL = await queryRunner.query(`
            SELECT 
                table_name, 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'role_permissions' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        
        console.log('Complete role_permissions table info:', createTableSQL);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is for inspection only, no rollback needed
    }
}
