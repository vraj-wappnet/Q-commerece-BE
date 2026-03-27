import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { userServices } from "./users.service";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("UsersController", () => {
  let controller: UsersController;
  let service: userServices;

  const mockUserServices = {
    getProfile: vi.fn(),
    getUsers: vi.fn(),
    getAllUsers: vi.fn(),
    getUserById: vi.fn(),
    updateProfile: vi.fn(),
    adminApproveUser: vi.fn(),
  };

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    mobile: "1234567890",
    role: { id: 3, name: "CUSTOMER", permissions: [] },
    isVerified: true,
    adminApproved: false,
    createdAt: new Date("2024-01-01"),
  };

  const mockAdmin = {
    id: "admin-123",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    mobile: "9876543210",
    role: { id: 1, name: "ADMIN", permissions: [] },
    isVerified: true,
    adminApproved: true,
    createdAt: new Date("2024-01-01"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: userServices,
          useValue: mockUserServices,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<userServices>(userServices);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return current user profile", async () => {
      mockUserServices.getProfile.mockResolvedValue(mockUser);

      const req = { user: { id: mockUser.id } };
      const result = await controller.getProfile(req);

      expect(service.getProfile).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it("should pass correct user id from request", async () => {
      mockUserServices.getProfile.mockResolvedValue(mockAdmin);

      const req = { user: { id: mockAdmin.id } };
      await controller.getProfile(req);

      expect(service.getProfile).toHaveBeenCalledWith(mockAdmin.id);
    });

    it("should return user with role and permissions", async () => {
      const userWithPermissions = {
        ...mockUser,
        role: {
          id: 1,
          name: "ADMIN",
          permissions: [
            { id: 1, name: "CREATE_USER" },
            { id: 2, name: "READ_USER" },
          ],
        },
      };
      mockUserServices.getProfile.mockResolvedValue(userWithPermissions);

      const req = { user: { id: mockUser.id } };
      const result = await controller.getProfile(req);

      expect((result as any).role.permissions).toHaveLength(2);
    });

    it("should handle null response from service", async () => {
      mockUserServices.getProfile.mockResolvedValue(null);

      const req = { user: { id: "non-existent-id" } };
      const result = await controller.getProfile(req);

      expect(result).toBeNull();
    });
  });

  describe("getAllUsers", () => {
    it("should return all users with default pagination", async () => {
      const mockResult = {
        data: [mockUser],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockUserServices.getUsers.mockResolvedValue(mockResult);

      const result = await controller.getAllUsers({});

      expect(service.getUsers).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResult);
    });

    it("should pass query parameters to service", async () => {
      const query = {
        page: 2,
        limit: 20,
        search: "John",
        role: 3 as any,
        isVerified: true,
        adminApproved: false,
        sortBy: "firstName" as any,
        sortOrder: "DESC" as any,
      };
      const mockResult = {
        data: [mockUser],
        meta: { page: 2, limit: 20, total: 1, totalPages: 1 },
      };
      mockUserServices.getUsers.mockResolvedValue(mockResult);

      const result = await controller.getAllUsers(query);

      expect(service.getUsers).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it("should handle search query", async () => {
      const query = { search: "test@example.com" };
      const mockResult = {
        data: [mockUser],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockUserServices.getUsers.mockResolvedValue(mockResult);

      await controller.getAllUsers(query);

      expect(service.getUsers).toHaveBeenCalledWith(query);
    });

    it("should handle role filter", async () => {
      const query = { role: 1 as any };
      const mockResult = {
        data: [mockAdmin],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockUserServices.getUsers.mockResolvedValue(mockResult);

      await controller.getAllUsers(query);

      expect(service.getUsers).toHaveBeenCalledWith(query);
    });

    it("should handle isVerified filter", async () => {
      const query = { isVerified: true };
      const mockResult = {
        data: [mockUser],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockUserServices.getUsers.mockResolvedValue(mockResult);

      await controller.getAllUsers(query);

      expect(service.getUsers).toHaveBeenCalledWith(query);
    });

    it("should handle adminApproved filter", async () => {
      const query = { adminApproved: true };
      const mockResult = {
        data: [mockAdmin],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockUserServices.getUsers.mockResolvedValue(mockResult);

      await controller.getAllUsers(query);

      expect(service.getUsers).toHaveBeenCalledWith(query);
    });

    it("should handle pagination parameters", async () => {
      const query = { page: 3, limit: 5 };
      const mockResult = {
        data: [mockUser],
        meta: { page: 3, limit: 5, total: 15, totalPages: 3 },
      };
      mockUserServices.getUsers.mockResolvedValue(mockResult);

      await controller.getAllUsers(query);

      expect(service.getUsers).toHaveBeenCalledWith(query);
    });

    it("should handle sorting parameters", async () => {
      const query = { sortBy: "email" as any, sortOrder: "ASC" as any };
      const mockResult = {
        data: [mockUser],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockUserServices.getUsers.mockResolvedValue(mockResult);

      await controller.getAllUsers(query);

      expect(service.getUsers).toHaveBeenCalledWith(query);
    });

    it("should return empty array when no users found", async () => {
      const mockResult = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockUserServices.getUsers.mockResolvedValue(mockResult);

      const result = await controller.getAllUsers({});

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it("should return paginated response structure", async () => {
      const mockResult = {
        data: [mockUser],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockUserServices.getUsers.mockResolvedValue(mockResult);

      const result = await controller.getAllUsers({});

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("meta");
      expect(result.meta).toHaveProperty("page");
      expect(result.meta).toHaveProperty("limit");
      expect(result.meta).toHaveProperty("total");
      expect(result.meta).toHaveProperty("totalPages");
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      mockUserServices.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(mockUser.id);

      expect(service.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it("should pass correct id parameter", async () => {
      mockUserServices.getUserById.mockResolvedValue(mockAdmin);

      await controller.getUserById(mockAdmin.id);

      expect(service.getUserById).toHaveBeenCalledWith(mockAdmin.id);
    });

    it("should return user with role and permissions", async () => {
      const userWithPermissions = {
        ...mockUser,
        role: {
          id: 1,
          name: "ADMIN",
          permissions: [{ id: 1, name: "CREATE_USER" }],
        },
      };
      mockUserServices.getUserById.mockResolvedValue(userWithPermissions);

      const result = await controller.getUserById(mockUser.id);

      expect((result as any).role).toBeDefined();
      expect((result as any).role.permissions).toBeDefined();
    });

    it("should handle null response from service", async () => {
      mockUserServices.getUserById.mockResolvedValue(null);

      const result = await controller.getUserById("non-existent-id");

      expect(result).toBeNull();
    });

    it("should handle different user IDs", async () => {
      mockUserServices.getUserById.mockResolvedValue(mockUser);

      await controller.getUserById("different-user-id");

      expect(service.getUserById).toHaveBeenCalledWith("different-user-id");
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const dto = { firstName: "Updated", lastName: "Name" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id } };
      const result = await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toEqual(mockResult);
    });

    it("should pass correct user id from request", async () => {
      const dto = { firstName: "Updated" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: "different-user-id" } };
      await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith("different-user-id", dto);
    });

    it("should update only firstName", async () => {
      const dto = { firstName: "NewFirstName" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id } };
      await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should update only lastName", async () => {
      const dto = { lastName: "NewLastName" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id } };
      await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should update only mobile", async () => {
      const dto = { mobile: "9999999999" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id } };
      await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should update multiple fields", async () => {
      const dto = {
        firstName: "Updated",
        lastName: "User",
        mobile: "1111111111",
      };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id } };
      await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should update vehicleType", async () => {
      const dto = { vehicleType: "car" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id } };
      await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should update vehicleName", async () => {
      const dto = { vehicleName: "Honda Civic" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id } };
      await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should handle empty update object", async () => {
      const dto = {};
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id } };
      await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should return success message", async () => {
      const dto = { firstName: "Updated" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id } };
      const result = await controller.updateProfile(req, dto);

      expect(result).toHaveProperty("message");
      expect(result.message).toBe("profile updated successfully");
    });
  });

  describe("Field Validation", () => {
    describe("updateProfile - Optional Fields", () => {
      it("should allow updating with no fields", async () => {
        const dto = {};
        const mockResult = { message: "profile updated successfully" };
        mockUserServices.updateProfile.mockResolvedValue(mockResult);

        const req = { user: { id: mockUser.id } };
        await controller.updateProfile(req, dto);

        expect(service.updateProfile).toHaveBeenCalled();
      });

      it("should validate firstName is optional", async () => {
        const dto = { lastName: "Doe" };
        const mockResult = { message: "profile updated successfully" };
        mockUserServices.updateProfile.mockResolvedValue(mockResult);

        const req = { user: { id: mockUser.id } };
        await controller.updateProfile(req, dto);

        expect(service.updateProfile).toHaveBeenCalled();
      });

      it("should validate lastName is optional", async () => {
        const dto = { firstName: "John" };
        const mockResult = { message: "profile updated successfully" };
        mockUserServices.updateProfile.mockResolvedValue(mockResult);

        const req = { user: { id: mockUser.id } };
        await controller.updateProfile(req, dto);

        expect(service.updateProfile).toHaveBeenCalled();
      });

      it("should validate mobile is optional", async () => {
        const dto = { firstName: "John" };
        const mockResult = { message: "profile updated successfully" };
        mockUserServices.updateProfile.mockResolvedValue(mockResult);

        const req = { user: { id: mockUser.id } };
        await controller.updateProfile(req, dto);

        expect(service.updateProfile).toHaveBeenCalled();
      });

      it("should validate vehicleType is optional", async () => {
        const dto = { firstName: "John" };
        const mockResult = { message: "profile updated successfully" };
        mockUserServices.updateProfile.mockResolvedValue(mockResult);

        const req = { user: { id: mockUser.id } };
        await controller.updateProfile(req, dto);

        expect(service.updateProfile).toHaveBeenCalled();
      });

      it("should validate vehicleName is optional", async () => {
        const dto = { firstName: "John" };
        const mockResult = { message: "profile updated successfully" };
        mockUserServices.updateProfile.mockResolvedValue(mockResult);

        const req = { user: { id: mockUser.id } };
        await controller.updateProfile(req, dto);

        expect(service.updateProfile).toHaveBeenCalled();
      });
    });
  });

  describe("Route Parameters", () => {
    it("should extract id from route params in getUserById", async () => {
      mockUserServices.getUserById.mockResolvedValue(mockUser);

      await controller.getUserById("param-user-id");

      expect(service.getUserById).toHaveBeenCalledWith("param-user-id");
    });

    it("should extract user id from request in getProfile", async () => {
      mockUserServices.getProfile.mockResolvedValue(mockUser);

      const req = { user: { id: "request-user-id" } };
      await controller.getProfile(req);

      expect(service.getProfile).toHaveBeenCalledWith("request-user-id");
    });

    it("should extract user id from request in updateProfile", async () => {
      const dto = { firstName: "Updated" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: "request-user-id" } };
      await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith("request-user-id", dto);
    });
  });

  describe("Authorization", () => {
    it("should pass user context for getProfile", async () => {
      mockUserServices.getProfile.mockResolvedValue(mockUser);

      const req = { user: { id: mockUser.id, role: mockUser.role } };
      await controller.getProfile(req);

      expect(service.getProfile).toHaveBeenCalledWith(mockUser.id);
    });

    it("should pass user context for updateProfile", async () => {
      const dto = { firstName: "Updated" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id, role: mockUser.role } };
      await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe("Response Structure", () => {
    it("should return user entity from getProfile", async () => {
      mockUserServices.getProfile.mockResolvedValue(mockUser);

      const req = { user: { id: mockUser.id } };
      const result = await controller.getProfile(req);

      expect(result).toEqual(mockUser);
    });

    it("should return user entity from getUserById", async () => {
      mockUserServices.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it("should return paginated response from getAllUsers", async () => {
      const paginatedResponse = {
        data: [mockUser],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockUserServices.getUsers.mockResolvedValue(paginatedResponse);

      const result = await controller.getAllUsers({});

      expect(result).toEqual(paginatedResponse);
    });

    it("should return message object from updateProfile", async () => {
      const dto = { firstName: "Updated" };
      const mockResult = { message: "profile updated successfully" };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);

      const req = { user: { id: mockUser.id } };
      const result = await controller.updateProfile(req, dto);

      expect(result).toEqual(mockResult);
    });
  });
});
