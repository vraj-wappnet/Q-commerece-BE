import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/modules/auth/entity/user.entity";
import { Repository, Brackets } from "typeorm";
import { userServices } from "./users.service";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("userServices", () => {
  let service: userServices;
  let userRepo: Repository<User>;

  const mockUserRepo = {
    findOne: vi.fn(),
    update: vi.fn(),
    createQueryBuilder: vi.fn(),
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
      providers: [
        userServices,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<userServices>(userServices);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return user profile with role and permissions", async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ["role", "role.permissions"],
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.getProfile("non-existent-id");

      expect(result).toBeNull();
    });

    it("should handle different user IDs", async () => {
      mockUserRepo.findOne.mockResolvedValue(mockAdmin);

      const result = await service.getProfile(mockAdmin.id);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockAdmin.id },
        relations: ["role", "role.permissions"],
      });
      expect(result).toEqual(mockAdmin);
    });

    it("should include role permissions in response", async () => {
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
      mockUserRepo.findOne.mockResolvedValue(userWithPermissions);

      const result = await service.getProfile(mockUser.id);

      expect((result as any).role.permissions).toHaveLength(2);
    });
  });

  describe("getAllUsers", () => {
    it("should return all users with default pagination", async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockUser], 1]),
      };
      mockUserRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllUsers();

      expect(userRepo.createQueryBuilder).toHaveBeenCalledWith("user");
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith("user.role", "role");
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("user.email", "ASC");
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: [mockUser],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    });
  });

  describe("getUsers", () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn(),
    };

    beforeEach(() => {
      mockUserRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it("should return users with default pagination", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.getUsers({});

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith("user.role", "role");
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("user.email", "ASC");
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: [mockUser],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    });

    it("should filter by search term", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      await service.getUsers({ search: "John" });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      const callArg = mockQueryBuilder.andWhere.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Brackets);
    });

    it("should handle empty search string", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      await service.getUsers({ search: "" });

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it("should handle whitespace-only search", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      await service.getUsers({ search: "   " });

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it("should filter by role name", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockAdmin], 1]);

      await service.getUsers({ role: "ADMIN" as any });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("role.name = :role", {
        role: "ADMIN",
      });
    });

    it("should filter by isVerified true", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      await service.getUsers({ isVerified: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "user.isVerified = :isVerified",
        { isVerified: true }
      );
    });

    it("should filter by isVerified false", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.getUsers({ isVerified: false });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "user.isVerified = :isVerified",
        { isVerified: false }
      );
    });

    it("should filter by adminApproved true", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockAdmin], 1]);

      await service.getUsers({ adminApproved: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "user.adminApproved = :adminApproved",
        { adminApproved: true }
      );
    });

    it("should filter by adminApproved false", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      await service.getUsers({ adminApproved: false });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "user.adminApproved = :adminApproved",
        { adminApproved: false }
      );
    });

    it("should handle custom pagination", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 25]);

      const result = await service.getUsers({ page: 2, limit: 5 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.totalPages).toBe(5);
    });

    it("should sort by firstName ascending", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      await service.getUsers({ sortBy: "firstName", sortOrder: "ASC" });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("user.firstName", "ASC");
    });

    it("should sort by email descending", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      await service.getUsers({ sortBy: "email", sortOrder: "DESC" });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("user.email", "DESC");
    });

    it("should combine multiple filters", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      await service.getUsers({
        search: "John",
        role: "CUSTOMER" as any,
        isVerified: true,
        adminApproved: false,
        page: 2,
        limit: 20,
        sortBy: "firstName",
        sortOrder: "DESC",
      });

      // andWhere is called 4 times: 1 for search (Brackets), 1 for role, 1 for isVerified, 1 for adminApproved
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(4);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("user.firstName", "DESC");
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it("should calculate total pages correctly", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 23]);

      const result = await service.getUsers({ page: 1, limit: 10 });

      expect(result.meta.totalPages).toBe(3);
    });

    it("should return empty array when no users found", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.getUsers({});

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it("should handle SQL injection attempts in search", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.getUsers({ search: "'; DROP TABLE users; --" });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it("should handle special characters in search", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.getUsers({ search: "test@example.com" });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    it("should return user by id with role and permissions", async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById(mockUser.id);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ["role", "role.permissions"],
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.getUserById("non-existent-id");

      expect(result).toBeNull();
    });

    it("should handle different user IDs", async () => {
      mockUserRepo.findOne.mockResolvedValue(mockAdmin);

      const result = await service.getUserById(mockAdmin.id);

      expect(result).toEqual(mockAdmin);
    });

    it("should include role and permissions", async () => {
      const userWithPermissions = {
        ...mockUser,
        role: {
          id: 1,
          name: "ADMIN",
          permissions: [{ id: 1, name: "CREATE_USER" }],
        },
      };
      mockUserRepo.findOne.mockResolvedValue(userWithPermissions);

      const result = await service.getUserById(mockUser.id);

      expect((result as any).role).toBeDefined();
      expect((result as any).role.permissions).toBeDefined();
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const dto = { firstName: "Updated", lastName: "Name" };
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(mockUser.id, dto);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toEqual({ message: "profile updated successfully" });
    });

    it("should exclude email from update", async () => {
      const dto = { firstName: "Updated", email: "newemail@example.com" };
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(mockUser.id, dto as any);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, {
        firstName: "Updated",
      });
    });

    it("should exclude password from update", async () => {
      const dto = { firstName: "Updated", password: "newpassword123" };
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(mockUser.id, dto as any);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, {
        firstName: "Updated",
      });
    });

    it("should exclude both email and password from update", async () => {
      const dto = {
        firstName: "Updated",
        email: "newemail@example.com",
        password: "newpassword123",
      };
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(mockUser.id, dto as any);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, {
        firstName: "Updated",
      });
    });

    it("should update only firstName", async () => {
      const dto = { firstName: "NewFirstName" };
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(mockUser.id, dto);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should update only lastName", async () => {
      const dto = { lastName: "NewLastName" };
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(mockUser.id, dto);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should update only mobile", async () => {
      const dto = { mobile: "9999999999" };
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(mockUser.id, dto);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should update multiple fields", async () => {
      const dto = {
        firstName: "Updated",
        lastName: "User",
        mobile: "1111111111",
      };
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(mockUser.id, dto);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should update vehicleType", async () => {
      const dto = { vehicleType: "car" };
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(mockUser.id, dto);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should update vehicleName", async () => {
      const dto = { vehicleName: "Honda Civic" };
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(mockUser.id, dto);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it("should handle empty update object", async () => {
      const dto = {};
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(mockUser.id, dto);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, {});
    });

    it("should handle database errors", async () => {
      const dto = { firstName: "Updated" };
      mockUserRepo.update.mockRejectedValue(new Error("Database error"));

      try {
        await service.updateProfile(mockUser.id, dto);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.message).toBe("Database error");
      }
    });
  });

  describe("adminApproveUser", () => {
    it("should approve user successfully", async () => {
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.adminApproveUser(mockUser.id);

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, {
        adminApproved: true,
      });
      expect(result).toEqual({ message: "user approved successfully" });
    });

    it("should handle different user IDs", async () => {
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.adminApproveUser("different-user-id");

      expect(userRepo.update).toHaveBeenCalledWith("different-user-id", {
        adminApproved: true,
      });
    });

    it("should handle database errors", async () => {
      mockUserRepo.update.mockRejectedValue(new Error("Database error"));

      try {
        await service.adminApproveUser(mockUser.id);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.message).toBe("Database error");
      }
    });

    it("should always set adminApproved to true", async () => {
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.adminApproveUser(mockUser.id);

      const updateCall = mockUserRepo.update.mock.calls[0][1];
      expect(updateCall.adminApproved).toBe(true);
    });
  });
});
