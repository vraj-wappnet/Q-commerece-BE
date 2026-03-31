import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RolesService } from './roles.service';
import { Role } from './entity/roles.entity';
import { Permission } from './entity/permission.entity';
import { MESSAGES } from '../../common/constant/message';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: Repository<Role>;
  let permissionRepository: Repository<Permission>;

  const mockRoleRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const mockPermissionRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const mockRole = {
    id: 1,
    name: 'CUSTOMER',
    description: 'Customer role',
    permissions: [],
  };

  const mockPermission = {
    id: 1,
    name: 'READ_PRODUCT',
    description: 'Read product permission',
    roles: [],
  };

  beforeEach(async () => {
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

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a role successfully', async () => {
      const name = 'MODERATOR';
      const description = 'Moderator role';
      mockRoleRepository.create.mockReturnValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(mockRole);

      const result = await service.createRole(name, description);

      expect(roleRepository.create).toHaveBeenCalledWith({ name, description });
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toEqual({
        message: MESSAGES.COMMON.POST_SUCCESS,
        data: mockRole,
      });
    });

    it('should create role with empty description', async () => {
      const name = 'TESTER';
      const description = '';
      mockRoleRepository.create.mockReturnValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(mockRole);

      const result = await service.createRole(name, description);

      expect(roleRepository.create).toHaveBeenCalledWith({ name, description: '' });
      expect(result.message).toBe(MESSAGES.COMMON.POST_SUCCESS);
    });

    it('should handle database errors', async () => {
      mockRoleRepository.create.mockReturnValue(mockRole);
      mockRoleRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createRole('TEST', 'Test')).rejects.toThrow('Database error');
    });

    it('should create role with special characters in name', async () => {
      const name = 'SUPER_ADMIN';
      const description = 'Super admin role';
      mockRoleRepository.create.mockReturnValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(mockRole);

      await service.createRole(name, description);

      expect(roleRepository.create).toHaveBeenCalledWith({ name, description });
    });

    it('should return correct response structure', async () => {
      mockRoleRepository.create.mockReturnValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(mockRole);

      const result = await service.createRole('TEST', 'Test');

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.message).toBe(MESSAGES.COMMON.POST_SUCCESS);
    });
  });

  describe('createPermisson', () => {
    it('should create a permission successfully', async () => {
      const name = 'MANAGE_USERS';
      const description = 'Manage users permission';
      mockPermissionRepository.create.mockReturnValue(mockPermission);
      mockPermissionRepository.save.mockResolvedValue(mockPermission);

      const result = await service.createPermisson(name, description);

      expect(permissionRepository.create).toHaveBeenCalledWith({ name, description });
      expect(permissionRepository.save).toHaveBeenCalledWith(mockPermission);
      expect(result).toEqual({
        message: MESSAGES.COMMON.POST_SUCCESS,
        data: mockPermission,
      });
    });

    it('should create permission with empty description', async () => {
      const name = 'TEST_PERMISSION';
      const description = '';
      mockPermissionRepository.create.mockReturnValue(mockPermission);
      mockPermissionRepository.save.mockResolvedValue(mockPermission);

      const result = await service.createPermisson(name, description);

      expect(permissionRepository.create).toHaveBeenCalledWith({ name, description: '' });
      expect(result.message).toBe(MESSAGES.COMMON.POST_SUCCESS);
    });

    it('should handle database errors', async () => {
      mockPermissionRepository.create.mockReturnValue(mockPermission);
      mockPermissionRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createPermisson('TEST', 'Test')).rejects.toThrow('Database error');
    });

    it('should create permission with special characters', async () => {
      const name = 'CREATE_ORDER';
      const description = 'Create order permission';
      mockPermissionRepository.create.mockReturnValue(mockPermission);
      mockPermissionRepository.save.mockResolvedValue(mockPermission);

      await service.createPermisson(name, description);

      expect(permissionRepository.create).toHaveBeenCalledWith({ name, description });
    });

    it('should return correct response structure', async () => {
      mockPermissionRepository.create.mockReturnValue(mockPermission);
      mockPermissionRepository.save.mockResolvedValue(mockPermission);

      const result = await service.createPermisson('TEST', 'Test');

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.message).toBe(MESSAGES.COMMON.POST_SUCCESS);
    });
  });

  describe('assignPermissionToRole', () => {
    it('should assign permissions to role successfully', async () => {
      const roleId = 1;
      const permissionIds = [1, 2, 3];
      const permissions = [
        { id: 1, name: 'READ' },
        { id: 2, name: 'WRITE' },
        { id: 3, name: 'DELETE' },
      ];
      const roleWithPermissions = { ...mockRole, permissions };

      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockPermissionRepository.find.mockResolvedValue(permissions);
      mockRoleRepository.save.mockResolvedValue(roleWithPermissions);

      const result = await service.assignPermissionToRole(roleId, permissionIds);

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
        relations: ['permissions'],
      });
      expect(permissionRepository.find).toHaveBeenCalledWith({
        where: { id: In(permissionIds) },
      });
      expect(result).toEqual(roleWithPermissions);
    });

    it('should throw error if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.assignPermissionToRole(999, [1, 2])).rejects.toThrow('Role not found');
    });

    it('should handle empty permission array', async () => {
      const roleId = 1;
      const permissionIds: number[] = [];

      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockPermissionRepository.find.mockResolvedValue([]);
      mockRoleRepository.save.mockResolvedValue(mockRole);

      const result = await service.assignPermissionToRole(roleId, permissionIds);

      expect(result.permissions).toEqual([]);
    });

    it('should replace existing permissions', async () => {
      const roleId = 1;
      const newPermissionIds = [4, 5];
      const existingRole = { ...mockRole, permissions: [{ id: 1, name: 'OLD' }] };
      const newPermissions = [
        { id: 4, name: 'NEW1' },
        { id: 5, name: 'NEW2' },
      ];

      mockRoleRepository.findOne.mockResolvedValue(existingRole);
      mockPermissionRepository.find.mockResolvedValue(newPermissions);
      mockRoleRepository.save.mockResolvedValue({ ...existingRole, permissions: newPermissions });

      const result = await service.assignPermissionToRole(roleId, newPermissionIds);

      expect(result.permissions).toEqual(newPermissions);
    });

    it('should handle single permission', async () => {
      const roleId = 1;
      const permissionIds = [1];
      const permissions = [{ id: 1, name: 'READ' }];

      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockPermissionRepository.find.mockResolvedValue(permissions);
      mockRoleRepository.save.mockResolvedValue({ ...mockRole, permissions });

      const result = await service.assignPermissionToRole(roleId, permissionIds);

      expect(result.permissions).toHaveLength(1);
    });
  });

  describe('getRoles', () => {
    it('should return all roles with permissions', async () => {
      const roles = [
        { id: 1, name: 'ADMIN', permissions: [] },
        { id: 2, name: 'USER', permissions: [] },
      ];
      mockRoleRepository.find.mockResolvedValue(roles);

      const result = await service.getRoles();

      expect(roleRepository.find).toHaveBeenCalledWith({
        relations: ['permissions'],
      });
      expect(result).toEqual({
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: roles,
      });
    });

    it('should return empty array when no roles exist', async () => {
      mockRoleRepository.find.mockResolvedValue([]);

      const result = await service.getRoles();

      expect(result.data).toEqual([]);
      expect(result.message).toBe(MESSAGES.COMMON.GET_SUCCESS);
    });

    it('should include permissions in response', async () => {
      const roles = [
        {
          id: 1,
          name: 'ADMIN',
          permissions: [{ id: 1, name: 'ALL' }],
        },
      ];
      mockRoleRepository.find.mockResolvedValue(roles);

      const result = await service.getRoles();

      expect(result.data[0].permissions).toBeDefined();
    });
  });

  describe('getPermissions', () => {
    it('should return all permissions', async () => {
      const permissions = [
        { id: 1, name: 'READ' },
        { id: 2, name: 'WRITE' },
      ];
      mockPermissionRepository.find.mockResolvedValue(permissions);

      const result = await service.getPermissions();

      expect(permissionRepository.find).toHaveBeenCalled();
      expect(result).toEqual({
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: permissions,
      });
    });

    it('should return empty array when no permissions exist', async () => {
      mockPermissionRepository.find.mockResolvedValue([]);

      const result = await service.getPermissions();

      expect(result.data).toEqual([]);
      expect(result.message).toBe(MESSAGES.COMMON.GET_SUCCESS);
    });
  });

  describe('getRoleById', () => {
    it('should return role by id with permissions', async () => {
      const roleId = 1;
      const role = {
        id: roleId,
        name: 'ADMIN',
        permissions: [{ id: 1, name: 'ALL' }],
      };
      mockRoleRepository.findOne.mockResolvedValue(role);

      const result = await service.getRoleById(roleId);

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
        relations: ['permissions'],
      });
      expect(result).toEqual({
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: role,
      });
    });

    it('should return null when role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      const result = await service.getRoleById(999);

      expect(result.data).toBeNull();
    });

    it('should include permissions in response', async () => {
      const role = {
        id: 1,
        name: 'USER',
        permissions: [{ id: 1, name: 'READ' }],
      };
      mockRoleRepository.findOne.mockResolvedValue(role);

      const result = await service.getRoleById(1);

      expect((result.data as any).permissions).toBeDefined();
      expect((result.data as any).permissions).toHaveLength(1);
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      const roleId = 2;
      const role = { id: roleId, name: 'CUSTOMER', permissions: [] };
      mockRoleRepository.findOne.mockResolvedValue(role);
      mockRoleRepository.remove.mockResolvedValue(role);

      const result = await service.deleteRole(roleId);

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
        relations: ['permissions'],
      });
      expect(roleRepository.remove).toHaveBeenCalledWith(role);
      expect(result).toEqual({
        message: MESSAGES.COMMON.DELETE_SUCCESS,
        data: { id: roleId },
      });
    });

    it('should throw error if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteRole(999)).rejects.toThrow('Role not found');
    });

    it('should prevent deletion of ADMIN role', async () => {
      const adminRole = { id: 1, name: 'ADMIN', permissions: [] };
      mockRoleRepository.findOne.mockResolvedValue(adminRole);

      await expect(service.deleteRole(1)).rejects.toThrow('Cannot delete ADMIN role');
      expect(roleRepository.remove).not.toHaveBeenCalled();
    });

    it('should allow deletion of non-ADMIN roles', async () => {
      const roles = ['CUSTOMER', 'SELLER', 'DELIVERY', 'MODERATOR'];

      for (const roleName of roles) {
        const role = { id: 2, name: roleName, permissions: [] };
        mockRoleRepository.findOne.mockResolvedValue(role);
        mockRoleRepository.remove.mockResolvedValue(role);

        await service.deleteRole(2);

        expect(roleRepository.remove).toHaveBeenCalledWith(role);
        vi.clearAllMocks();
      }
    });

    it('should delete role with permissions', async () => {
      const role = {
        id: 2,
        name: 'CUSTOMER',
        permissions: [{ id: 1, name: 'READ' }],
      };
      mockRoleRepository.findOne.mockResolvedValue(role);
      mockRoleRepository.remove.mockResolvedValue(role);

      const result = await service.deleteRole(2);

      expect(result.message).toBe(MESSAGES.COMMON.DELETE_SUCCESS);
    });
  });

  describe('deletePermission', () => {
    it('should delete permission successfully', async () => {
      const permissionId = 1;
      const permission = { id: permissionId, name: 'READ', roles: [] };
      mockPermissionRepository.findOne.mockResolvedValue(permission);
      mockPermissionRepository.remove.mockResolvedValue(permission);

      const result = await service.deletePermission(permissionId);

      expect(permissionRepository.findOne).toHaveBeenCalledWith({
        where: { id: permissionId },
        relations: ['roles'],
      });
      expect(permissionRepository.remove).toHaveBeenCalledWith(permission);
      expect(result).toEqual({
        message: MESSAGES.COMMON.DELETE_SUCCESS,
        data: { id: permissionId },
      });
    });

    it('should throw error if permission not found', async () => {
      mockPermissionRepository.findOne.mockResolvedValue(null);

      await expect(service.deletePermission(999)).rejects.toThrow('Permission not found');
    });

    it('should delete permission with roles', async () => {
      const permission = {
        id: 1,
        name: 'READ',
        roles: [{ id: 1, name: 'USER' }],
      };
      mockPermissionRepository.findOne.mockResolvedValue(permission);
      mockPermissionRepository.remove.mockResolvedValue(permission);

      const result = await service.deletePermission(1);

      expect(result.message).toBe(MESSAGES.COMMON.DELETE_SUCCESS);
    });
  });

  describe('removePermissionFromRole', () => {
    it('should remove permission from role successfully', async () => {
      const roleId = 1;
      const permissionId = 2;
      const role = { id: roleId, name: 'USER', permissions: [] };
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 1 }),
      };

      mockRoleRepository.findOne.mockResolvedValue(role);
      mockRoleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.removePermissionFromRole(roleId, permissionId);

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
        relations: ['permissions'],
      });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith('role_permissions');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('roleid = :roleId', { roleId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('permissionid = :permissionId', { permissionId });
      expect(result).toEqual({
        message: MESSAGES.COMMON.DELETE_SUCCESS,
        data: { roleId, permissionId },
      });
    });

    it('should throw error if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.removePermissionFromRole(999, 1)).rejects.toThrow('Role not found');
    });

    it('should handle different role and permission IDs', async () => {
      const testCases = [
        { roleId: 1, permissionId: 1 },
        { roleId: 2, permissionId: 3 },
        { roleId: 5, permissionId: 10 },
      ];

      for (const { roleId, permissionId } of testCases) {
        const role = { id: roleId, name: 'TEST', permissions: [] };
        const mockQueryBuilder = {
          delete: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          andWhere: vi.fn().mockReturnThis(),
          execute: vi.fn().mockResolvedValue({ affected: 1 }),
        };

        mockRoleRepository.findOne.mockResolvedValue(role);
        mockRoleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const result = await service.removePermissionFromRole(roleId, permissionId);

        expect(result.data).toEqual({ roleId, permissionId });
        vi.clearAllMocks();
      }
    });
  });
});
