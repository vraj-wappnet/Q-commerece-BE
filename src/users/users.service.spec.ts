import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/auth/entity/user.entity";
import { Repository } from "typeorm";
import { userServices } from "./users.service";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("userServices", () => {
  let service: userServices;
  let repo: Repository<User>;

  const mockUser = {
    id: "1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
  };

  const mockUserRepo = {
    findOne: vi.fn(),
    update: vi.fn(),
    createQueryBuilder: vi.fn(),
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
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getProfile", () => {
    it("should return a user profile", async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.getProfile("1");
      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
    });
  });

  describe("getAllUsers", () => {
    it("should return paginated users", async () => {
      const qb = {
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockUser], 1]),
      };
      mockUserRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAllUsers();

      expect(result).toEqual({
        data: [mockUser],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      expect(mockUserRepo.createQueryBuilder).toHaveBeenCalledWith("user");
    });
  });

  describe("getUserById", () => {
    it("should return a user by ID", async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.getUserById("1");
      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
    });
  });

  describe("updateProfile", () => {
    it("should update user profile (excluding email and password)", async () => {
      const dto = { firstName: "Updated", email: "should-not-update@test.com" };
      mockUserRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateProfile("1", dto as any);

      expect(result).toEqual({ message: "profile updated successfully" });
      expect(mockUserRepo.update).toHaveBeenCalledWith("1", {
        firstName: "Updated",
      });
    });
  });

  describe("adminApproveUser", () => {
    it("should approve a user", async () => {
      mockUserRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.adminApproveUser("1");

      expect(result).toEqual({ message: "user approved successfully" });
      expect(mockUserRepo.update).toHaveBeenCalledWith("1", {
        adminApproved: true,
      });
    });
  });
});
