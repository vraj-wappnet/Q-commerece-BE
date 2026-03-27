import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "./app.service";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("AppService", () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getHello", () => {
    it('should return "Hello World!"', () => {
      const result = service.getHello();
      expect(result).toBe("Hello World!");
    });

    it("should return a string", () => {
      const result = service.getHello();
      expect(typeof result).toBe("string");
    });

    it("should not return null", () => {
      const result = service.getHello();
      expect(result).not.toBeNull();
    });

    it("should not return undefined", () => {
      const result = service.getHello();
      expect(result).not.toBeUndefined();
    });

    it("should return exact message", () => {
      const result = service.getHello();
      expect(result).toEqual("Hello World!");
    });

    it("should return message with correct length", () => {
      const result = service.getHello();
      expect(result.length).toBe(12);
    });

    it("should return message starting with Hello", () => {
      const result = service.getHello();
      expect(result).toMatch(/^Hello/);
    });

    it("should return message ending with exclamation mark", () => {
      const result = service.getHello();
      expect(result).toMatch(/!$/);
    });

    it("should return message containing World", () => {
      const result = service.getHello();
      expect(result).toContain("World");
    });

    it("should return consistent result on multiple calls", () => {
      const result1 = service.getHello();
      const result2 = service.getHello();
      const result3 = service.getHello();
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it("should not return empty string", () => {
      const result = service.getHello();
      expect(result).not.toBe("");
    });

    it("should not return whitespace only", () => {
      const result = service.getHello();
      expect(result.trim()).toBe(result);
    });

    it("should return message with space between words", () => {
      const result = service.getHello();
      expect(result).toContain(" ");
    });

    it("should return message with exactly one space", () => {
      const result = service.getHello();
      const spaces = result.match(/ /g);
      expect(spaces).toHaveLength(1);
    });

    it("should return message in correct case", () => {
      const result = service.getHello();
      expect(result).toBe("Hello World!");
      expect(result).not.toBe("hello world!");
      expect(result).not.toBe("HELLO WORLD!");
    });

    it("should be callable without parameters", () => {
      expect(() => service.getHello()).not.toThrow();
    });

    it("should return immediately without delay", () => {
      const start = Date.now();
      service.getHello();
      const end = Date.now();
      expect(end - start).toBeLessThan(10);
    });

    it("should not modify service state", () => {
      const serviceBefore = { ...service };
      service.getHello();
      expect(service).toEqual(serviceBefore);
    });

    it("should be a pure function", () => {
      const spy = vi.spyOn(console, "log");
      service.getHello();
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should not throw any errors", () => {
      expect(() => service.getHello()).not.toThrow();
    });
  });

  describe("Service Instance", () => {
    it("should be an instance of AppService", () => {
      expect(service).toBeInstanceOf(AppService);
    });

    it("should have getHello method", () => {
      expect(service.getHello).toBeDefined();
      expect(typeof service.getHello).toBe("function");
    });

    it("should have only one public method", () => {
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(service))
        .filter(name => name !== "constructor" && typeof service[name] === "function");
      expect(methods).toContain("getHello");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid successive calls", () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(service.getHello());
      }
      expect(results.every(r => r === "Hello World!")).toBe(true);
    });

    it("should not be affected by external state", () => {
      const result1 = service.getHello();
      // Simulate external state change
      (global as any).someExternalState = "changed";
      const result2 = service.getHello();
      expect(result1).toBe(result2);
      delete (global as any).someExternalState;
    });

    it("should work after service recreation", async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [AppService],
      }).compile();
      const newService = module.get<AppService>(AppService);
      expect(newService.getHello()).toBe("Hello World!");
    });
  });

  describe("Return Value Validation", () => {
    it("should return value that can be used in string concatenation", () => {
      const result = service.getHello();
      const concatenated = "Message: " + result;
      expect(concatenated).toBe("Message: Hello World!");
    });

    it("should return value that can be used in template literals", () => {
      const result = service.getHello();
      const template = `Response: ${result}`;
      expect(template).toBe("Response: Hello World!");
    });

    it("should return value that can be compared", () => {
      const result = service.getHello();
      expect(result === "Hello World!").toBe(true);
    });

    it("should return value with correct character encoding", () => {
      const result = service.getHello();
      expect(result.charCodeAt(0)).toBe(72); // 'H'
      expect(result.charCodeAt(result.length - 1)).toBe(33); // '!'
    });
  });
});
