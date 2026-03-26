import { User } from "src/modules/auth/entity/user.entity";
import { 
  UserProfileVm, 
  UserPublicVm, 
  UserAdminVm, 
  UserUpdateVm, 
  UserListVm 
} from "../vm/user.vm";

export class UserMapper {
  static toUserProfileVm(user: User): UserProfileVm {
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
      profileCompletion: this.calculateProfileCompletion(user),
      createdAt: user.createdAt,
    };
  }

  static toUserPublicVm(user: User): UserPublicVm {
    return {
      id: user.id,
      displayName: `${user.firstName} ${user.lastName}`,
      joinedAt: user.createdAt,
      role: user.role,
    };
  }

  static toUserAdminVm(user: User, additionalData?: { orderCount?: number; totalSpent?: number; lastLoginAt?: Date }): UserAdminVm {
    return {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isVerified: user.isVerified,
      adminApproved: user.adminApproved,
      status: this.getUserStatus(user),
      registrationDate: user.createdAt,
      lastLoginAt: additionalData?.lastLoginAt,
      orderCount: additionalData?.orderCount,
      totalSpent: additionalData?.totalSpent,
    };
  }

  static toUserListVm(user: User): UserListVm {
    return {
      id: user.id,
      displayName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isVerified: user.isVerified,
      adminApproved: user.adminApproved,
      createdAt: user.createdAt,
    };
  }

  static toUserProfileVmList(users: User[]): UserProfileVm[] {
    return users.map(user => this.toUserProfileVm(user));
  }

  static toUserPublicVmList(users: User[]): UserPublicVm[] {
    return users.map(user => this.toUserPublicVm(user));
  }

  static toUserAdminVmList(users: User[], additionalData?: { orderCount?: number; totalSpent?: number; lastLoginAt?: Date }[]): UserAdminVm[] {
    return users.map((user, index) => 
      this.toUserAdminVm(user, additionalData?.[index])
    );
  }

  static toUserListVmList(users: User[]): UserListVm[] {
    return users.map(user => this.toUserListVm(user));
  }

  static updateUserEntity(updateVm: UserUpdateVm): Partial<User> {
    const entity: Partial<User> = {};
    
    Object.keys(updateVm).forEach(key => {
      const value = updateVm[key as keyof UserUpdateVm];
      if (value !== undefined) {
        entity[key as keyof User] = value as any;
      }
    });
    
    return entity;
  }

  private static calculateProfileCompletion(user: User): number {
    const fields = [
      user.firstName,
      user.lastName,
      user.email,
      user.mobile,
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  private static getUserStatus(user: User): string {
    if (!user.isVerified) {
      return 'Pending Verification';
    }
    
    if (!user.adminApproved) {
      return 'Pending Approval';
    }
    
    return 'Active';
  }
}
