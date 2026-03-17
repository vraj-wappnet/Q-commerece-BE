import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/auth/entity/user.entity";
import { Brackets, Repository } from "typeorm";
import { updateProfileDto } from "./dto/update-profile.dto";
import { GetUsersQueryDto } from "./dto/get-users.query.dto";

@Injectable()
export class userServices {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getProfile(userId: string) {
    return this.userRepo.findOne({
      where: { id: userId },
    });
  }

  async getAllUsers() {
    return this.getUsers({});
  }

  async getUsers(query: GetUsersQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isVerified,
      adminApproved,
      sortBy = "email",
      sortOrder = "ASC",
    } = query;

    const qb = this.userRepo.createQueryBuilder("user");

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where("user.firstName ILIKE :term", { term })
            .orWhere("user.lastName ILIKE :term", { term })
            .orWhere("user.email ILIKE :term", { term })
            .orWhere("user.mobile ILIKE :term", { term });
        }),
      );
    }

    if (role !== undefined) {
      qb.andWhere("user.role = :role", { role });
    }

    if (isVerified !== undefined) {
      qb.andWhere("user.isVerified = :isVerified", { isVerified });
    }

    if (adminApproved !== undefined) {
      qb.andWhere("user.adminApproved = :adminApproved", { adminApproved });
    }

    qb.orderBy(`user.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async updateProfile(userId: string, dto: updateProfileDto) {
    // Defensive check: Ensure email and password are never updated here
    const { email, password, ...updateData } = dto as any;

    await this.userRepo.update(userId, updateData);

    return { message: "profile updated successfully" };
  }

  async adminApproveUser(userId: string) {
    await this.userRepo.update(userId, {
      adminApproved: true,
    });
    return { message: "user approved successfully" };
  }
}
