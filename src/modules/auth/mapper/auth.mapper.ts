import { User } from "../entity/user.entity";
import { 
  UserVm, 
  AuthResponseVm, 
  LoginResponseVm, 
  RegisterResponseVm, 
  OtpVerificationVm, 
  PasswordResetVm,
  UserSummaryVm 
} from "../vm/auth.vm";

export class AuthMapper {
  static toUserVm(user: User): UserVm {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isVerified: user.isVerified,
      adminApproved: user.adminApproved,
      fullName: `${user.firstName} ${user.lastName}`,
    };
  }

  static toUserSummaryVm(user: User): UserSummaryVm {
    return {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      adminApproved: user.adminApproved,
    };
  }

  static toAuthResponseVm(user: User, accessToken: string): AuthResponseVm {
    return {
      accessToken,
      user: this.toUserVm(user),
    };
  }

  static toLoginResponseVm(user: User, token: string, expiresIn: number = 3600): LoginResponseVm {
    return {
      token,
      user: this.toUserVm(user),
      expiresIn,
    };
  }

  static toRegisterResponseVm(user: User): RegisterResponseVm {
    return {
      message: "User registered successfully. Please verify your email.",
      user: this.toUserVm(user),
    };
  }

  static toOtpVerificationVm(user: User, accessToken?: string): OtpVerificationVm {
    const response: OtpVerificationVm = {
      message: "OTP verified successfully",
      user: this.toUserVm(user),
    };

    if (accessToken) {
      response.accessToken = accessToken;
    }

    return response;
  }

  static toPasswordResetVm(): PasswordResetVm {
    return {
      message: "Password reset successfully",
    };
  }

  static toUserVmList(users: User[]): UserVm[] {
    return users.map(user => this.toUserVm(user));
  }

  static toUserSummaryVmList(users: User[]): UserSummaryVm[] {
    return users.map(user => this.toUserSummaryVm(user));
  }
}
