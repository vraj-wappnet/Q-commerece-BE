import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Otp } from "src/modules/auth/entity/otp.entity";
import { User } from "src/modules/auth/entity/user.entity";
import { Repository, In } from "typeorm";
import * as bcrypt from "bcrypt";
import { MailService } from "src/modules/mail/mail.service";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { resendOtpDto } from "./dto/resend-otp.dto";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { Role } from "src/modules/roles-permission/entity/roles.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,

    private jwtService: JwtService,
    private mailService: MailService,

    @InjectQueue("emailQueue")
    private emailQueue: Queue,
  ) {}

  generateotp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    // Get the customer role
    const customerRole = await this.userRepo.manager.getRepository(Role).findOne({ where: { name: 'CUSTOMER' } });

    const userData = {
      ...dto,
      password: hashed,
      role: customerRole!,
    };

    const user = this.userRepo.create(userData);
    await this.userRepo.save(user);

    const otp = this.generateotp();

    const otpRecord = this.otpRepo.create({
      email: dto.email,
      otp,
      expiresAt: new Date(Date.now() + 300000),
    });

    await this.otpRepo.save(otpRecord);

    await this.emailQueue.add("sendOtp", {
      email: dto.email,
      otp,
    });
    
    return { message: "Otp is sent to register email" };
  }
  async verifyOtp(email: string, otp: string) {
    const record = await this.otpRepo
      .createQueryBuilder("otp")
      .where("otp.email = :email", { email })
      .andWhere("otp.otp = :otp", { otp })
      .getOne();

    if (!record) throw new UnauthorizedException("Invalid OTP");

    await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({ isVerified: true })
      .where("email = :email", { email })
      .execute();
    return { message: "otp verified" };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ 
      where: { email },
      relations: ['role', 'role.permissions']
    });

    if (!user) throw new UnauthorizedException();

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException();

    if (!user.isVerified) {
      throw new UnauthorizedException("OTP is not verified");
    }

    if (
      (user.role?.name === 'SELLER' || user.role?.name === 'DELIVERY') &&
      !user.adminApproved
    ) {
      throw new UnauthorizedException("Admin approval is pending");
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    if (!user.isVerified) {
      throw new UnauthorizedException("User is not verified");
    }

    const otp = this.generateotp();

    const otpRecord = await this.otpRepo.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 300000),
    });

    await this.otpRepo.save(otpRecord);
    await this.mailService.sendOtp(email, otp);

    return {
      message: "Forgot password OTP sent to email",
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new Error("password does not match");
    }

    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({
        password: hashedPassword,
      })
      .where("email = :email", { email: dto.email })
      .execute();

    return { message: "Password reset successfully" };
  }

  async resendOtp(dto: resendOtpDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (!user) {
      throw new Error("User not found");
    }

    const otp = this.generateotp();

    const existingOtp = await this.otpRepo.findOne({
      where: { email: dto.email },
    });

    if (existingOtp) {
      await this.otpRepo
        .createQueryBuilder()
        .update()
        .set({
          otp,
          expiresAt: new Date(Date.now() + 300000),
        })
        .where("email = :email", { email: dto.email })
        .execute();
    } else {
      const otpRecord = await this.otpRepo.create({
        email: dto.email,
        otp,
        expiresAt: new Date(Date.now() + 300000),
      });

      await this.otpRepo.save(otpRecord);
    }

    await this.emailQueue.add("sendOtp", {
      email: dto.email,
      otp,
    });
    await this.mailService.sendOtp(dto.email, otp);

    return {
      message: "OTP sent to email",
    };
  }
}
