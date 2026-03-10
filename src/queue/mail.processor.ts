import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailService } from "src/mail/mail.service";

@Processor("emailQueue")
export class MailProcessor extends WorkerHost {
  constructor(private mailService: MailService) {
    super();
  }

  async process(job: Job<any>) {
    if (job.name === "sendOtp") {
      const { email, otp } = job.data;
      await this.mailService.sendOtp(email, otp);
    }
  }
}
