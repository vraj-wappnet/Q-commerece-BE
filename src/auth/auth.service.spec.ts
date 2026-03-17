import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { Otp } from "./entity/otp.entity";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "src/mail/mail.service";
import { getQueueToken } from "@nestjs/bullmq";
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as bcrypt from "bcrypt";
import { UserRole } from "src/common/enum/roles.enum";

vi.mock("bcrypt", () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;

  const mockUserRepo = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const mockOtpRepo = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const mockJwtService = {
    sign: vi.fn(),
  };

  const mockMailService = {
    sendOtp: vi.fn(),
  };

  const mockQueue = {
    add: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Otp),
          useValue: mockOtpRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: getQueueToken("emailQueue"),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("generateotp", () => {
    it("should generate a 6 digit string", () => {
      const otp = service.generateotp();
      expect(otp).toHaveLength(6);
      expect(Number(otp)).toBeGreaterThanOrEqual(100000);
    });
  });

  describe("login", () => {
    it("should return tokens on valid credentials", async () => {
      const user = {
        id: "1",
        email: "test@test.com",
        password: "hashed",
        isVerified: true,
        role: UserRole.CUSTOMER,
      };
      mockUserRepo.findOne.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue("token");

      const result = await service.login("test@test.com", "password");
      expect(result).toEqual({ accessToken: "token", user });
    });

    it("should throw UnauthorizedException on invalid password", async () => {
      const user = { id: "1", email: "test@test.com", password: "hashed" };
      mockUserRepo.findOne.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login("test@test.com", "wrong")).rejects.toThrow();
    });
  });
});
