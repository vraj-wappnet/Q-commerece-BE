import { Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { userServices } from "src/users/users.service";


@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(jwtAuthGuard, RolesGuard)
@Controller("admin")


export class AdminController {

    constructor(private userServices: userServices) { }

    @Patch("approve/:id")
    @Roles("admin")
    @ApiOperation({ summary: "Admin approve seller or delivery" })
    approveSellerOrDelivery(@Param("id") id: string) {
        return this.userServices.adminApproveUser(id)
    }

}