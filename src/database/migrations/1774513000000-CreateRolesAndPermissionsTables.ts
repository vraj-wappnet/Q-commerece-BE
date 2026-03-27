import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRolesAndPermissionsTables1774513000000 implements MigrationInterface {
    name = 'CreateRolesAndPermissionsTables1774513000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create roles table
        await queryRunner.query(`
            CREATE TABLE roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create permissions table
        await queryRunner.query(`
            CREATE TABLE permissions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create role_permissions junction table
        await queryRunner.query(`
            CREATE TABLE role_permissions (
                roleId INT REFERENCES roles(id) ON DELETE CASCADE,
                permissionId INT REFERENCES permissions(id) ON DELETE CASCADE,
                PRIMARY KEY (roleId, permissionId)
            )
        `);

        // Create indexes for better performance
        await queryRunner.query(`
            CREATE INDEX idx_role_permissions_roleId ON role_permissions(roleId)
        `);
        
        await queryRunner.query(`
            CREATE INDEX idx_role_permissions_permissionId ON role_permissions(permissionId)
        `);

        // Insert default roles
        await queryRunner.query(`
            INSERT INTO roles (name, description) VALUES 
            ('ADMIN', 'Administrator with full access'),
            ('SELLER', 'Shop owner with limited access'),
            ('CUSTOMER', 'Regular customer with basic access'),
            ('DELIVERY', 'Delivery person with delivery access')
        `);

        // Insert default permissions
        await queryRunner.query(`
            INSERT INTO permissions (name, description) VALUES 
            ('CREATE_USER', 'Create new users'),
            ('READ_USER', 'View user information'),
            ('UPDATE_USER', 'Update user information'),
            ('DELETE_USER', 'Delete users'),
            ('CREATE_SHOP', 'Create new shops'),
            ('READ_SHOP', 'View shop information'),
            ('UPDATE_SHOP', 'Update shop information'),
            ('DELETE_SHOP', 'Delete shops'),
            ('CREATE_ORDER', 'Create new orders'),
            ('READ_ORDER', 'View order information'),
            ('UPDATE_ORDER', 'Update order information'),
            ('DELETE_ORDER', 'Delete orders'),
            ('CREATE_PRODUCT', 'Create new products'),
            ('READ_PRODUCT', 'View product information'),
            ('UPDATE_PRODUCT', 'Update product information'),
            ('DELETE_PRODUCT', 'Delete products'),
            ('MANAGE_DELIVERY', 'Manage delivery assignments'),
            ('VIEW_ANALYTICS', 'View analytics and reports'),
            ('MANAGE_MEDIA', 'Upload and manage media files')
        `);

        // Assign permissions to roles
        await queryRunner.query(`
            INSERT INTO role_permissions (roleId, permissionId) 
            SELECT r.id, p.id FROM roles r, permissions p 
            WHERE r.name = 'ADMIN'
        `);

        await queryRunner.query(`
            INSERT INTO role_permissions (roleId, permissionId) 
            SELECT r.id, p.id FROM roles r, permissions p 
            WHERE r.name = 'SELLER' AND p.name IN (
                'CREATE_SHOP', 'READ_SHOP', 'UPDATE_SHOP', 
                'CREATE_PRODUCT', 'READ_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
                'READ_ORDER', 'UPDATE_ORDER', 'MANAGE_MEDIA'
            )
        `);

        await queryRunner.query(`
            INSERT INTO role_permissions (roleId, permissionId) 
            SELECT r.id, p.id FROM roles r, permissions p 
            WHERE r.name = 'CUSTOMER' AND p.name IN (
                'READ_USER', 'READ_SHOP', 'READ_PRODUCT', 
                'CREATE_ORDER', 'READ_ORDER', 'UPDATE_ORDER'
            )
        `);

        await queryRunner.query(`
            INSERT INTO role_permissions (roleId, permissionId) 
            SELECT r.id, p.id FROM roles r, permissions p 
            WHERE r.name = 'DELIVERY' AND p.name IN (
                'READ_USER', 'READ_ORDER', 'UPDATE_ORDER', 'MANAGE_DELIVERY'
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS role_permissions`);
        await queryRunner.query(`DROP TABLE IF EXISTS permissions`);
        await queryRunner.query(`DROP TABLE IF EXISTS roles`);
    }
}
