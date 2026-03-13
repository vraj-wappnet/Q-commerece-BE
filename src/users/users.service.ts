import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/auth/entity/user.entity";
import { Repository } from "typeorm";
import { updateProfileDto } from "./dto/update-profile.dto";


@Injectable()

export class userServices {
    constructor(@InjectRepository(User)
    private userRepo: Repository<User>) { }

    async getProfile(userId: string) {
        return this.userRepo.findOne({
            where: { id: userId }
        });
    }

    async getAllUsers() {
        return this.userRepo.find();
    }

    async getUserById(id: string) {
        return this.userRepo.findOne({
            where: { id },
        })
    }

    async updateProfile(userId: string, dto: updateProfileDto) {
        // Defensive check: Ensure email and password are never updated here
        const { email, password, ...updateData } = dto as any;
        
        await this.userRepo.update(userId, updateData);

        return { message: "profile updated successfully" }
    }

    async adminApproveUser(userId: string) {

        await this.userRepo.update(userId, {
            adminApproved: true
        })
        return { message: "user approved successfully" }
    }
}