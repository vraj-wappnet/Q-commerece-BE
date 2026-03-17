import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { JwtStrategy } from "./jwt.strategy";
import { UnauthorizedException } from "@nestjs/common";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let userRepo: any;

  const mockUserRepo = {
    findOne: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn().mockReturnValue("test_secret"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepo = module.get(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should return user if user exists", async () => {
      const mockUser = { id: "1", email: "test@test.com" };
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate({ userId: "1" });
      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
    });

    it("should throw UnauthorizedException if user does not exist", async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(strategy.validate({ userId: "1" })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
