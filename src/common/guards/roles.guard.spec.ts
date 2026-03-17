import { Test, TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { RolesGuard } from "./roles.guard";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRole } from "../enum/roles.enum";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should return true if no roles are defined", () => {
    vi.spyOn(reflector, "get").mockReturnValue(null);

    const context = {
      getHandler: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({ user: { role: UserRole.ADMIN } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should return true if user role matches", () => {
    vi.spyOn(reflector, "get").mockReturnValue([UserRole.ADMIN]);

    const context = {
      getHandler: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({ user: { role: UserRole.ADMIN } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should return false if user role does not match", () => {
    vi.spyOn(reflector, "get").mockReturnValue([UserRole.ADMIN]);

    const context = {
      getHandler: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi
          .fn()
          .mockReturnValue({ user: { role: UserRole.CUSTOMER } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(false);
  });
});
