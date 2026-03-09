import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from 'src/otp/otp.entity';
import { User } from 'src/users/user.entity';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { resendOtpDto } from './dto/resend-otp.dto';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(Otp)
        private otpRepo: Repository<Otp>,

        private jwtService: JwtService,
        private mailService: MailService
    ) { }

    generateotp() {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }

    async register(dto: any) {
        const hashed = await bcrypt.hash(dto.password, 10)
        const user = this.userRepo.create({
            ...dto,
            password: hashed
        })
        await this.userRepo.save(user);

        const otp = this.generateotp();

        const otpRecord = this.otpRepo.create({
            email: dto.email,
            otp,
            expiresAt: new Date(Date.now() + 300000)
        })

        await this.otpRepo.save(otpRecord);
        await this.mailService.sendOtp(dto.email, otp);
        return { message: 'Otp is sent to register email' }
    }
    async verifyOtp(email: string, otp: string) {
        const record = await this.otpRepo
            .createQueryBuilder('otp')
            .where("otp.email = :email", { email })
            .andWhere("otp.otp = :otp", { otp })
            .getOne()

        if (!record) throw new UnauthorizedException('Invalid OTP')

        await this.userRepo
            .createQueryBuilder()
            .update(User)
            .set({ isVerified: true })
            .where("email = :email", { email })
            .execute()
        return { message: "otp verified" }
    }

    async login(email: string, password: string) {
        const user = await this.userRepo.findOne({ where: { email } });

        if (!user) throw new UnauthorizedException();

        const match = await bcrypt.compare(password, user.password)
        if (!match) throw new UnauthorizedException();

        if (!user.isVerified) {
            throw new UnauthorizedException('OTP is not verified');
        }

        if ((user.role === "seller" || user.role === "delivery") && !user.adminApproved) {
            throw new UnauthorizedException("Admin approval is pending")
        }

        const payload = {
            userId: user.id,
            role: user.role
        }

        const token = this.jwtService.sign(payload)

        return {
            accessToken: token,
            user
        }
    }

    async forgotPassword(email: string) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) throw new Error("User not found")
        const otp = this.generateotp();

        const otpRecord = await this.otpRepo.create({
            email, otp, expiresAt: new Date(Date.now() + 300000)
        })

        await this.otpRepo.save(otpRecord);
        await this.mailService.sendOtp(email, otp);

        return {
            message: "Forgot password OTp sent to email"
        }
    }

    async resetPassword(dto: ResetPasswordDto) {
        if (dto.password !== dto.confirmPassword) {
            throw new Error('password does not match')
        }

        const user = await this.userRepo.findOne({
            where: { email: dto.email }
        })

        if (!user) {
            throw new Error("User not found");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        await this.userRepo
            .createQueryBuilder()
            .update(User)
            .set({
                password: hashedPassword
            })
            .where("email = :email", { email: dto.email })
            .execute()

        return { message: "Password reset successfully" }
    }

    async resendOtp(dto: resendOtpDto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } })

        if (!user) {
            throw new Error("User not found")
        }

        const otp = this.generateotp();

        const existingOtp = await this.otpRepo.findOne({
            where: { email: dto.email }
        })

        if (existingOtp) {
            await this.otpRepo
                .createQueryBuilder()
                .update()
                .set({
                    otp,
                    expiresAt: new Date(Date.now() + 300000)
                })
                .where("email = :email", { email: dto.email })
                .execute()

        }
        else {
            const otpRecord = await this.otpRepo.create({
                email: dto.email,
                otp,
                expiresAt: new Date(Date.now() + 300000)
            })

            await this.otpRepo.save(otpRecord)
        }

        await this.mailService.sendOtp(dto.email, otp)

        return {
            message : "OTP sent to email"
        }

    }

}
