import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { updateProfileDto } from "./dto/update-profile.dto";
import { userServices } from "./users.service";
import { GetUsersQueryDto } from "./dto/get-users.query.dto";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(jwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private userServices: userServices) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  getProfile(@Req() req) {
    return this.userServices.getProfile(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all users" })
  getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.userServices.getUsers(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  getUserById(@Param("id") id: string) {
    return this.userServices.getUserById(id);
  }

  @Patch("user-profile")
  @ApiOperation({ summary: "Update user profile" })
  updateProfile(@Req() req, @Body() dto: updateProfileDto) {
    return this.userServices.updateProfile(req.user.id, dto);
  }
}
