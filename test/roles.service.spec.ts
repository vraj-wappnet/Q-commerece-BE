import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from '../src/modules/roles-permission/roles.service';
import { Role } from '../src/modules/roles-permission/entity/roles.entity';
import { Permission } from '../src/modules/roles-permission/entity/permission.entity';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: Repository<Role>;
  let permissionRepository: Repository<Permission>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'quick_commerce_test',
          entities: [Role, Permission],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([Role, Permission]),
      ],
      providers: [RolesService],
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a role', async () => {
    const role = await service.createRole('TEST_ROLE', 'Test role description');
    expect(role).toBeDefined();
    expect(role.name).toBe('TEST_ROLE');
  });

  it('should create a permission', async () => {
    const permission = await service.createPermisson('TEST_PERMISSION', 'Test permission description');
    expect(permission).toBeDefined();
    expect(permission.name).toBe('TEST_PERMISSION');
  });

  it('should assign permissions to role', async () => {
    const role = await service.createRole('TEST_ROLE_WITH_PERMS', 'Test role with permissions');
    const permission = await service.createPermisson('TEST_PERMISSION_FOR_ROLE', 'Test permission for role');
    
    const updatedRole = await service.assignPermissionToRole(role.id, [permission.id]);
    expect(updatedRole).toBeDefined();
    expect(updatedRole.permissions).toHaveLength(1);
    expect(updatedRole.permissions[0].name).toBe('TEST_PERMISSION_FOR_ROLE');
  });
});
