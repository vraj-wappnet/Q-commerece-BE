import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesService } from '../src/modules/roles-permission/roles.service';
import { Role } from '../src/modules/roles-permission/entity/roles.entity';
import { Permission } from '../src/modules/roles-permission/entity/permission.entity';
import { vi } from 'vitest';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: Repository<Role>;
  let permissionRepository: Repository<Permission>;

  const mockRoleRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const mockPermissionRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a role', async () => {
    const mockRole = { id: 1, name: 'TEST_ROLE', description: 'Test role description' };
    mockRoleRepository.create.mockReturnValue(mockRole);
    mockRoleRepository.save.mockResolvedValue(mockRole);
    
    const role = await service.createRole('TEST_ROLE', 'Test role description');
    expect(role).toBeDefined();
    expect(role.data.name).toBe('TEST_ROLE');
  });

  it('should create a permission', async () => {
    const mockPermission = { id: 1, name: 'TEST_PERMISSION', description: 'Test permission description' };
    mockPermissionRepository.create.mockReturnValue(mockPermission);
    mockPermissionRepository.save.mockResolvedValue(mockPermission);
    
    const permission = await service.createPermisson('TEST_PERMISSION', 'Test permission description');
    expect(permission).toBeDefined();
    expect(permission.data.name).toBe('TEST_PERMISSION');
  });

  it('should assign permissions to role', async () => {
    const mockRole = { id: 1, name: 'TEST_ROLE_WITH_PERMS', permissions: [] };
    const mockPermission = { id: 1, name: 'TEST_PERMISSION_FOR_ROLE' };
    
    mockRoleRepository.findOne.mockResolvedValue(mockRole);
    mockPermissionRepository.find.mockResolvedValue([mockPermission]);
    mockRoleRepository.save.mockResolvedValue({ ...mockRole, permissions: [mockPermission] });
    
    const updatedRole = await service.assignPermissionToRole(1, [1]);
    expect(updatedRole).toBeDefined();
    expect(updatedRole.permissions).toHaveLength(1);
    expect(updatedRole.permissions[0].name).toBe('TEST_PERMISSION_FOR_ROLE');
  });
});
