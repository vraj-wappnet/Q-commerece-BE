import { Controller, Get, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    getMyNotifications(@Req() req) {
        return this.notificationService.getUserNotifications(req.user.userId);
    }
}