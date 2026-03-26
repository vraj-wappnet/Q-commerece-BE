import { Test, TestingModule } from "@nestjs/testing";
import { MailProcessor } from "./mail.processor";
import { MailService } from "src/modules/mail/mail.service";
import { Job } from "bullmq";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("MailProcessor", () => {
  let processor: MailProcessor;
  let mailService: MailService;

  const mockMailService = {
    sendOtp: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailProcessor,
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    processor = module.get<MailProcessor>(MailProcessor);
    mailService = module.get<MailService>(MailService);
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(processor).toBeDefined();
  });

  describe("process", () => {
    it("should call mailService.sendOtp when job name is sendOtp", async () => {
      const mockJob = {
        name: "sendOtp",
        data: { email: "test@example.com", otp: "123456" },
      } as Job;

      await processor.process(mockJob);

      expect(mockMailService.sendOtp).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
      );
    });

    it("should not call mailService.sendOtp when job name is not sendOtp", async () => {
      const mockJob = {
        name: "otherJob",
        data: {},
      } as Job;

      await processor.process(mockJob);

      expect(mockMailService.sendOtp).not.toHaveBeenCalled();
    });
  });
});
