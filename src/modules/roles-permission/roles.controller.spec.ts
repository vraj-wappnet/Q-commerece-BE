import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { MESSAGES } from '../../common/constant/message';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRolesService = {
    createRole: vi.fn(),
    createPermisson: vi.fn(),
    assignPermissionToRole: vi.fn(),
    getRoles: vi.fn(),
    getPermissions: vi.fn(),
    getRoleById: vi.fn(),
    deleteRole: vi.fn(),
    deletePermission: vi.fn(),
    removePermissionFromRole: vi.fn(),
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRoles', () => {
    it('should return all roles with permissions', async () => {
      const roles = [mockRole];
      const response = {
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: roles,
      };
      mockRolesService.getRoles.mockResolvedValue(response);

      const result = await controller.getRoles();

      expect(service.getRoles).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('should return empty array when no roles exist', async () => {
      const response = {
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: [],
      };
      mockRolesService.getRoles.mockResolvedValue(response);

      const result = await controller.getRoles();

      expect(result.data).toEqual([]);
    });

    it('should handle service errors', async () => {
      mockRolesService.getRoles.mockRejectedValue(new Error('Database error'));

      await expect(controller.getRoles()).rejects.toThrow('Database error');
    });
  });

  describe('createRole', () => {
    it('should create role with name and description', async () => {
      const body = { name: 'MODERATOR', description: 'Moderator role' };
      const response = {
        message: MESSAGES.COMMON.POST_SUCCESS,
        data: mockRole,
      };
      mockRolesService.createRole.mockResolvedValue(response);

      const result = await controller.createRole(body);

      expect(service.createRole).toHaveBeenCalledWith('MODERATOR', 'Moderator role');
      expect(result).toEqual(response);
    });

    it('should create role with only name (no description)', async () => {
      const body = { name: 'TESTER' };
      const response = {
        message: MESSAGES.COMMON.POST_SUCCESS,
        data: mockRole,
      };
      mockRolesService.createRole.mockResolvedValue(response);

      const result = await controller.createRole(body);

      expect(service.createRole).toHaveBeenCalledWith('TESTER', '');
      expect(result.message).toBe(MESSAGES.COMMON.POST_SUCCESS);
    });

    it('should handle empty description', async () => {
      const body = { name: 'TEST', description: '' };
      mockRolesService.createRole.mockResolvedValue({
        message: MESSAGES.COMMON.POST_SUCCESS,
        data: mockRole,
      });

      await controller.createRole(body);

      expect(service.createRole).toHaveBeenCalledWith('TEST', '');
    });

    it('should handle special characters in name', async () => {
      const body = { name: 'SUPER_ADMIN', description: 'Super admin' };
      mockRolesService.createRole.mockResolvedValue({
        message: MESSAGES.COMMON.POST_SUCCESS,
        data: mockRole,
      });

      await controller.createRole(body);

      expect(service.createRole).toHaveBeenCalledWith('SUPER_ADMIN', 'Super admin');
    });

    it('should handle service errors', async () => {
      const body = { name: 'TEST', description: 'Test' };
      mockRolesService.createRole.mockRejectedValue(new Error('Duplicate role'));

      await expect(controller.createRole(body)).rejects.toThrow('Duplicate role');
    });
  });

  describe('createPermission', () => {
    it('should create permission with name and description', async () => {
      const body = { name: 'MANAGE_USERS', description: 'Manage users' };
      const response = {
        message: MESSAGES.COMMON.POST_SUCCESS,
        data: mockPermission,
      };
      mockRolesService.createPermisson.mockResolvedValue(response);

      const result = await controller.createPermission(body);

      expect(service.createPermisson).toHaveBeenCalledWith('MANAGE_USERS', 'Manage users');
      expect(result).toEqual(response);
    });

    it('should create permission with only name', async () => {
      const body = { name: 'TEST_PERMISSION' };
      mockRolesService.createPermisson.mockResolvedValue({
        message: MESSAGES.COMMON.POST_SUCCESS,
        data: mockPermission,
      });

      const result = await controller.createPermission(body);

      expect(service.createPermisson).toHaveBeenCalledWith('TEST_PERMISSION', '');
    });

    it('should handle empty description', async () => {
      const body = { name: 'TEST', description: '' };
      mockRolesService.createPermisson.mockResolvedValue({
        message: MESSAGES.COMMON.POST_SUCCESS,
        data: mockPermission,
      });

      await controller.createPermission(body);

      expect(service.createPermisson).toHaveBeenCalledWith('TEST', '');
    });

    it('should handle service errors', async () => {
      const body = { name: 'TEST', description: 'Test' };
      mockRolesService.createPermisson.mockRejectedValue(new Error('Duplicate permission'));

      await expect(controller.createPermission(body)).rejects.toThrow('Duplicate permission');
    });
  });

  describe('assignPermissions', () => {
    it('should assign permissions to role successfully', async () => {
      const roleId = 1;
      const body = { permissionIds: [1, 2, 3] };
      const roleWithPermissions = {
        ...mockRole,
        permissions: [
          { id: 1, name: 'READ' },
          { id: 2, name: 'WRITE' },
          { id: 3, name: 'DELETE' },
        ],
      };
      mockRolesService.assignPermissionToRole.mockResolvedValue(roleWithPermissions);

      const result = await controller.assignPermissions(roleId, body);

      expect(service.assignPermissionToRole).toHaveBeenCalledWith(roleId, [1, 2, 3]);
      expect(result).toEqual(roleWithPermissions);
    });

    it('should handle empty permission array', async () => {
      const roleId = 1;
      const body = { permissionIds: [] };
      mockRolesService.assignPermissionToRole.mockResolvedValue(mockRole);

      const result = await controller.assignPermissions(roleId, body);

      expect(service.assignPermissionToRole).toHaveBeenCalledWith(roleId, []);
    });

    it('should handle undefined permissionIds', async () => {
      const roleId = 1;
      const body = {} as any;
      mockRolesService.assignPermissionToRole.mockResolvedValue(mockRole);

      const result = await controller.assignPermissions(roleId, body);

      expect(service.assignPermissionToRole).toHaveBeenCalledWith(roleId, []);
    });

    it('should convert string IDs to numbers', async () => {
      const roleId = 1;
      const body = { permissionIds: ['1', '2', '3'] as any };
      mockRolesService.assignPermissionToRole.mockResolvedValue(mockRole);

      await controller.assignPermissions(roleId, body);

      expect(service.assignPermissionToRole).toHaveBeenCalledWith(roleId, [1, 2, 3]);
    });

    it('should handle single permission', async () => {
      const roleId = 1;
      const body = { permissionIds: [1] };
      mockRolesService.assignPermissionToRole.mockResolvedValue(mockRole);

      await controller.assignPermissions(roleId, body);

      expect(service.assignPermissionToRole).toHaveBeenCalledWith(roleId, [1]);
    });

    it('should handle service errors', async () => {
      const roleId = 999;
      const body = { permissionIds: [1] };
      mockRolesService.assignPermissionToRole.mockRejectedValue(new Error('Role not found'));

      await expect(controller.assignPermissions(roleId, body)).rejects.toThrow('Role not found');
    });
  });

  describe('getPermissions', () => {
    it('should return all permissions', async () => {
      const permissions = [mockPermission];
      const response = {
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: permissions,
      };
      mockRolesService.getPermissions.mockResolvedValue(response);

      const result = await controller.getPermissions();

      expect(service.getPermissions).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('should return empty array when no permissions exist', async () => {
      const response = {
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: [],
      };
      mockRolesService.getPermissions.mockResolvedValue(response);

      const result = await controller.getPermissions();

      expect(result.data).toEqual([]);
    });

    it('should handle service errors', async () => {
      mockRolesService.getPermissions.mockRejectedValue(new Error('Database error'));

      await expect(controller.getPermissions()).rejects.toThrow('Database error');
    });
  });

  describe('getRole', () => {
    it('should return role by id with permissions', async () => {
      const roleId = 1;
      const role = {
        ...mockRole,
        permissions: [mockPermission],
      };
      const response = {
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: role,
      };
      mockRolesService.getRoleById.mockResolvedValue(response);

      const result = await controller.getRole(roleId);

      expect(service.getRoleById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(response);
    });

    it('should handle non-existent role', async () => {
      const roleId = 999;
      const response = {
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: null,
      };
      mockRolesService.getRoleById.mockResolvedValue(response);

      const result = await controller.getRole(roleId);

      expect(result.data).toBeNull();
    });

    it('should handle different role IDs', async () => {
      const testIds = [1, 5, 10, 100];

      for (const roleId of testIds) {
        mockRolesService.getRoleById.mockResolvedValue({
          message: MESSAGES.COMMON.GET_SUCCESS,
          data: { ...mockRole, id: roleId },
        });

        await controller.getRole(roleId);

        expect(service.getRoleById).toHaveBeenCalledWith(roleId);
        vi.clearAllMocks();
      }
    });

    it('should handle service errors', async () => {
      mockRolesService.getRoleById.mockRejectedValue(new Error('Database error'));

      await expect(controller.getRole(1)).rejects.toThrow('Database error');
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      const roleId = 2;
      const response = {
        message: MESSAGES.COMMON.DELETE_SUCCESS,
        data: { id: roleId },
      };
      mockRolesService.deleteRole.mockResolvedValue(response);

      const result = await controller.deleteRole(roleId);

      expect(service.deleteRole).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(response);
    });

    it('should handle role not found', async () => {
      const roleId = 999;
      mockRolesService.deleteRole.mockRejectedValue(new Error('Role not found'));

      await expect(controller.deleteRole(roleId)).rejects.toThrow('Role not found');
    });

    it('should prevent deletion of ADMIN role', async () => {
      const roleId = 1;
      mockRolesService.deleteRole.mockRejectedValue(new Error('Cannot delete ADMIN role'));

      await expect(controller.deleteRole(roleId)).rejects.toThrow('Cannot delete ADMIN role');
    });

    it('should handle different role IDs', async () => {
      const testIds = [2, 3, 4, 5];

      for (const roleId of testIds) {
        mockRolesService.deleteRole.mockResolvedValue({
          message: MESSAGES.COMMON.DELETE_SUCCESS,
          data: { id: roleId },
        });

        const result = await controller.deleteRole(roleId);

        expect(result.data.id).toBe(roleId);
        vi.clearAllMocks();
      }
    });

    it('should handle service errors', async () => {
      mockRolesService.deleteRole.mockRejectedValue(new Error('Database error'));

      await expect(controller.deleteRole(1)).rejects.toThrow('Database error');
    });
  });

  describe('deletePermission', () => {
    it('should delete permission successfully', async () => {
      const permissionId = 1;
      const response = {
        message: MESSAGES.COMMON.DELETE_SUCCESS,
        data: { id: permissionId },
      };
      mockRolesService.deletePermission.mockResolvedValue(response);

      const result = await controller.deletePermission(permissionId);

      expect(service.deletePermission).toHaveBeenCalledWith(permissionId);
      expect(result).toEqual(response);
    });

    it('should handle permission not found', async () => {
      const permissionId = 999;
      mockRolesService.deletePermission.mockRejectedValue(new Error('Permission not found'));

      await expect(controller.deletePermission(permissionId)).rejects.toThrow('Permission not found');
    });

    it('should handle different permission IDs', async () => {
      const testIds = [1, 5, 10, 20];

      for (const permissionId of testIds) {
        mockRolesService.deletePermission.mockResolvedValue({
          message: MESSAGES.COMMON.DELETE_SUCCESS,
          data: { id: permissionId },
        });

        const result = await controller.deletePermission(permissionId);

        expect(result.data.id).toBe(permissionId);
        vi.clearAllMocks();
      }
    });

    it('should handle service errors', async () => {
      mockRolesService.deletePermission.mockRejectedValue(new Error('Database error'));

      await expect(controller.deletePermission(1)).rejects.toThrow('Database error');
    });
  });

  describe('removePermissionFromRole', () => {
    it('should remove permission from role successfully', async () => {
      const roleId = 1;
      const permissionId = 2;
      const response = {
        message: MESSAGES.COMMON.DELETE_SUCCESS,
        data: { roleId, permissionId },
      };
      mockRolesService.removePermissionFromRole.mockResolvedValue(response);

      const result = await controller.removePermissionFromRole(roleId, permissionId);

      expect(service.removePermissionFromRole).toHaveBeenCalledWith(roleId, permissionId);
      expect(result).toEqual(response);
    });

    it('should handle role not found', async () => {
      mockRolesService.removePermissionFromRole.mockRejectedValue(new Error('Role not found'));

      await expect(controller.removePermissionFromRole(999, 1)).rejects.toThrow('Role not found');
    });

    it('should handle different role and permission combinations', async () => {
      const testCases = [
        { roleId: 1, permissionId: 1 },
        { roleId: 2, permissionId: 3 },
        { roleId: 5, permissionId: 10 },
      ];

      for (const { roleId, permissionId } of testCases) {
        mockRolesService.removePermissionFromRole.mockResolvedValue({
          message: MESSAGES.COMMON.DELETE_SUCCESS,
          data: { roleId, permissionId },
        });

        const result = await controller.removePermissionFromRole(roleId, permissionId);

        expect(result.data).toEqual({ roleId, permissionId });
        vi.clearAllMocks();
      }
    });

    it('should handle service errors', async () => {
      mockRolesService.removePermissionFromRole.mockRejectedValue(new Error('Database error'));

      await expect(controller.removePermissionFromRole(1, 1)).rejects.toThrow('Database error');
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle ParseIntPipe for roleId in getRole', async () => {
      const roleId = 1;
      mockRolesService.getRoleById.mockResolvedValue({
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: mockRole,
      });

      await controller.getRole(roleId);

      expect(service.getRoleById).toHaveBeenCalledWith(1);
    });

    it('should handle ParseIntPipe for roleId in assignPermissions', async () => {
      const roleId = 1;
      const body = { permissionIds: [1, 2] };
      mockRolesService.assignPermissionToRole.mockResolvedValue(mockRole);

      await controller.assignPermissions(roleId, body);

      expect(service.assignPermissionToRole).toHaveBeenCalledWith(1, [1, 2]);
    });

    it('should handle ParseIntPipe for roleId in deleteRole', async () => {
      const roleId = 2;
      mockRolesService.deleteRole.mockResolvedValue({
        message: MESSAGES.COMMON.DELETE_SUCCESS,
        data: { id: roleId },
      });

      await controller.deleteRole(roleId);

      expect(service.deleteRole).toHaveBeenCalledWith(2);
    });

    it('should handle ParseIntPipe for permissionId in deletePermission', async () => {
      const permissionId = 1;
      mockRolesService.deletePermission.mockResolvedValue({
        message: MESSAGES.COMMON.DELETE_SUCCESS,
        data: { id: permissionId },
      });

      await controller.deletePermission(permissionId);

      expect(service.deletePermission).toHaveBeenCalledWith(1);
    });

    it('should handle ParseIntPipe for both IDs in removePermissionFromRole', async () => {
      const roleId = 1;
      const permissionId = 2;
      mockRolesService.removePermissionFromRole.mockResolvedValue({
        message: MESSAGES.COMMON.DELETE_SUCCESS,
        data: { roleId, permissionId },
      });

      await controller.removePermissionFromRole(roleId, permissionId);

      expect(service.removePermissionFromRole).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('Response Structure Validation', () => {
    it('should return correct structure for getRoles', async () => {
      const response = {
        message: MESSAGES.COMMON.GET_SUCCESS,
        data: [mockRole],
      };
      mockRolesService.getRoles.mockResolvedValue(response);

      const result = await controller.getRoles();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return correct structure for createRole', async () => {
      const response = {
        message: MESSAGES.COMMON.POST_SUCCESS,
        data: mockRole,
      };
      mockRolesService.createRole.mockResolvedValue(response);

      const result = await controller.createRole({ name: 'TEST', description: 'Test' });

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.message).toBe(MESSAGES.COMMON.POST_SUCCESS);
    });

    it('should return correct structure for deleteRole', async () => {
      const response = {
        message: MESSAGES.COMMON.DELETE_SUCCESS,
        data: { id: 2 },
      };
      mockRolesService.deleteRole.mockResolvedValue(response);

      const result = await controller.deleteRole(2);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.message).toBe(MESSAGES.COMMON.DELETE_SUCCESS);
    });
  });
});
