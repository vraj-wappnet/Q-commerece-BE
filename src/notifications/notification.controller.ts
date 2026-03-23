import { Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { NotificationService } from "./notification.service";

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
@UseGuards(jwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    getMyNotifications(@Req() req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException();
        }
        return this.notificationService.getUserNotifications(userId);
    }

    @Patch(":id/read")
    markNotificationAsRead(@Param("id", new ParseUUIDPipe()) id: string, @Req() req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException();
        }
        return this.notificationService.markNotificationAsRead(id, userId);
    }

    @Delete()
    deleteAllMyNotifications(@Req() req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException();
        }
        return this.notificationService.deleteAllUserNotifications(userId);
    }
}
