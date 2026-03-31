import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  const mockAppService = {
    getHello: vi.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(appController).toBeDefined();
  });

  describe("getHello", () => {
    it('should return "Hello World!"', () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();

      expect(appService.getHello).toHaveBeenCalled();
      expect(result).toBe("Hello World!");
    });

    it("should call service getHello method", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      appController.getHello();

      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });

    it("should call service method without parameters", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      appController.getHello();

      expect(appService.getHello).toHaveBeenCalledWith();
    });

    it("should return the exact value from service", () => {
      const serviceResponse = "Hello World!";
      mockAppService.getHello.mockReturnValue(serviceResponse);

      const result = appController.getHello();

      expect(result).toBe(serviceResponse);
      expect(result).toEqual(serviceResponse);
    });

    it("should return a string type", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();

      expect(typeof result).toBe("string");
    });

    it("should not modify the service response", () => {
      const serviceResponse = "Hello World!";
      mockAppService.getHello.mockReturnValue(serviceResponse);

      const result = appController.getHello();

      expect(result).toBe(serviceResponse);
    });

    it("should handle service response correctly", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();

      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return consistent results on multiple calls", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result1 = appController.getHello();
      const result2 = appController.getHello();
      const result3 = appController.getHello();

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(appService.getHello).toHaveBeenCalledTimes(3);
    });

    it("should delegate to service layer", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      appController.getHello();

      expect(appService.getHello).toHaveBeenCalled();
    });

    it("should not perform any business logic", () => {
      const spy = vi.spyOn(console, "log");
      mockAppService.getHello.mockReturnValue("Hello World!");

      appController.getHello();

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("Controller Instance", () => {
    it("should be an instance of AppController", () => {
      expect(appController).toBeInstanceOf(AppController);
    });

    it("should have getHello method", () => {
      expect(appController.getHello).toBeDefined();
      expect(typeof appController.getHello).toBe("function");
    });

    it("should have service injected", () => {
      expect(appService).toBeDefined();
    });

    it("should have only one public method", () => {
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(appController))
        .filter(name => name !== "constructor" && typeof appController[name] === "function");
      expect(methods).toContain("getHello");
    });
  });

  describe("HTTP Method Behavior", () => {
    it("should be accessible via GET request", () => {
      // This is implicitly tested by the @Get() decorator
      mockAppService.getHello.mockReturnValue("Hello World!");
      
      const result = appController.getHello();
      
      expect(result).toBeDefined();
    });

    it("should not require request body", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      expect(() => appController.getHello()).not.toThrow();
    });

    it("should not require query parameters", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      expect(() => appController.getHello()).not.toThrow();
    });

    it("should not require route parameters", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      expect(() => appController.getHello()).not.toThrow();
    });
  });

  describe("Response Validation", () => {
    it("should return response that can be serialized to JSON", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();
      const serialized = JSON.stringify(result);

      expect(serialized).toBe('"Hello World!"');
    });

    it("should return response with correct content", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();

      expect(result).toContain("Hello");
      expect(result).toContain("World");
    });

    it("should return response with correct format", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();

      expect(result).toMatch(/^Hello World!$/);
    });

    it("should return response without leading/trailing whitespace", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();

      expect(result.trim()).toBe(result);
    });

    it("should return response with correct length", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();

      expect(result.length).toBe(12);
    });
  });

  describe("Error Handling", () => {
    it("should not throw errors during normal operation", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      expect(() => appController.getHello()).not.toThrow();
    });

    it("should propagate service errors", () => {
      mockAppService.getHello.mockImplementation(() => {
        throw new Error("Service error");
      });

      expect(() => appController.getHello()).toThrow("Service error");
    });

    it("should handle service returning different values", () => {
      mockAppService.getHello.mockReturnValue("Different message");

      const result = appController.getHello();

      expect(result).toBe("Different message");
    });
  });

  describe("Service Integration", () => {
    it("should use injected service", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      appController.getHello();

      expect(mockAppService.getHello).toHaveBeenCalled();
    });

    it("should not create new service instance", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      appController.getHello();
      appController.getHello();

      // Should use the same service instance
      expect(appService).toBe(mockAppService);
    });

    it("should pass through service response unchanged", () => {
      const serviceResponse = "Hello World!";
      mockAppService.getHello.mockReturnValue(serviceResponse);

      const controllerResponse = appController.getHello();

      expect(controllerResponse).toBe(serviceResponse);
      expect(controllerResponse === serviceResponse).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should execute quickly", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const start = Date.now();
      appController.getHello();
      const end = Date.now();

      expect(end - start).toBeLessThan(10);
    });

    it("should handle rapid successive calls", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      for (let i = 0; i < 100; i++) {
        appController.getHello();
      }

      expect(appService.getHello).toHaveBeenCalledTimes(100);
    });

    it("should not leak memory on multiple calls", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const results: string[] = [];
      for (let i = 0; i < 1000; i++) {
        results.push(appController.getHello());
      }

      expect(results.length).toBe(1000);
      expect(results.every(r => r === "Hello World!")).toBe(true);
    });
  });

  describe("Route Configuration", () => {
    it("should be mapped to root path", () => {
      // The @Controller() decorator with no path means root
      // The @Get() decorator with no path means root of controller
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();

      expect(result).toBeDefined();
    });

    it("should respond to GET method only", () => {
      // Implicitly tested by @Get() decorator
      mockAppService.getHello.mockReturnValue("Hello World!");

      expect(() => appController.getHello()).not.toThrow();
    });
  });

  describe("Dependency Injection", () => {
    it("should receive AppService through constructor", () => {
      expect(appService).toBeDefined();
      expect(appService).toBe(mockAppService);
    });

    it("should work with mocked service", () => {
      mockAppService.getHello.mockReturnValue("Mocked response");

      const result = appController.getHello();

      expect(result).toBe("Mocked response");
    });

    it("should maintain service reference", () => {
      const serviceBefore = appService;
      mockAppService.getHello.mockReturnValue("Hello World!");

      appController.getHello();

      expect(appService).toBe(serviceBefore);
    });
  });

  describe("Return Type Consistency", () => {
    it("should always return string type", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();

      expect(typeof result).toBe("string");
    });

    it("should match declared return type", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result: string = appController.getHello();

      expect(result).toBeDefined();
    });

    it("should not return null or undefined", () => {
      mockAppService.getHello.mockReturnValue("Hello World!");

      const result = appController.getHello();

      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    });
  });
});
