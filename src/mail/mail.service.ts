import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    async sendOtp(email: string, otp: string) {

        await this.mailerService.sendMail({
            to: email,
            from: process.env.MAIL_USER,
            subject: "OTP verification",
            html: `  <h2>Your OTP Code</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>`

        })
    }
}