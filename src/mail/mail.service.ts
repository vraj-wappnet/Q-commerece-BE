import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { join } from "path";

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendOtp(email: string, otp: string) {
    const logoPath = join(__dirname, "..", "assets", "images", "logo.png");
    const otpArray = otp.split("");
    const otpBoxes = otpArray
      .map(
        (char) => `
                <div style="display: inline-block; width: 45px; height: 50px; line-height: 50px; text-align: center; border: 1px solid #2563EB; border-radius: 10px; margin: 0 5px; font-size: 24px; font-weight: bold; color: #1F2937; background-color: #ffffff;">
                    ${char}
                </div>
            `,
      )
      .join("");

    await this.mailerService.sendMail({
      to: email,
      from: `"SwiftMart Support" <${process.env.MAIL_USER}>`,
      subject: "Verify Your SwiftMart Account - OTP Code",
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "swiftmart-logo",
        },
      ],
      html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
            </head>
            <body style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #F5F7FA; color: #1F2937;">
                <table cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 40px auto; border-top: 11px solid #2563EB; background-color: #ffffff; border-radius: 0 0 20px 20px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);">
                    <tr>
                        <td style="text-align: center; padding: 40px 0;">
                            <img src="cid:swiftmart-logo" alt="SwiftMart" style="width: 180px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 25px 40px 25px;">
                            <div style="padding: 30px; border: 1px solid #2563EB; border-radius: 20px; background-color: rgba(37, 99, 235, 0.05); text-align: center;">
                                <p style="color: #2563EB; font-weight: 700; font-size: 20px; margin: 0;">Hello there! 👋</p>
                                <p style="color: #1F2937; font-weight: 400; font-size: 16px; line-height: 24px; margin: 20px 0 10px 0;">
                                    Welcome to SwiftMart. Use the code below to verify your account and start shopping at lightning speed.
                                    <br />
                                    <span style="color: #6B7280; font-size: 13px;">This code is valid for the next 5 minutes.</span>
                                </p>
                                
                                <h2 style="font-size: 20px; font-weight: 600; color: #1F2937; margin: 30px 0 15px 0;">Confirmation Code</h2>
                                
                                <div style="margin-bottom: 30px;">
                                    ${otpBoxes}
                                </div>
                                
                                <p style="color: #1F2937; font-weight: 600; font-size: 16px; margin: 0 0 5px 0;">Thank You</p>
                                <p style="margin: 0; color: #2563EB; font-weight: 700; font-size: 14px;">SwiftMart Team ⚡</p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding-bottom: 30px; color: #6B7280; font-size: 12px;">
                            <p>© 2026 SwiftMart Quick Commerce. All rights reserved.</p>
                            <p>Freshness Delivered Fast.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `,
    });
  }
}
