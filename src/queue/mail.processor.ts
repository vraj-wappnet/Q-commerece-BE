import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailService } from "src/modules/mail/mail.service";
import { Logger } from "@nestjs/common";

@Processor("emailQueue")
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private mailService: MailService) {
    super();
  }

  async process(job: Job<any>) {
    this.logger.log(`Processing job: ${job.name} with data:`, job.data);
    
    if (job.name === "sendOtp") {
      const { email, otp } = job.data;
      this.logger.log(`Sending OTP to: ${email}`);
      
      try {
        await this.mailService.sendOtp(email, otp);
        this.logger.log(`OTP sent successfully to: ${email}`);
      } catch (error) {
        this.logger.error(`Failed to send OTP to ${email}:`, error);
        throw error;
      }
    }
  }
}
