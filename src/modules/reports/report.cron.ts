import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ReportService } from "./report.service";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../auth/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class ReportCron {
    constructor(private ReportService: ReportService,
        @InjectRepository(User)
    private userRepository: Repository<User>
    ) {}

    @Cron('59 23 * * *')
    async sendDailyReport() {
        console.log('Daily report sent');

        //seller
        const sellers = await this.userRepository.find({
            where : {
                role: {
                    name: 'seller'
                }
            }
        }) 

        for (const seller of sellers){
            const csv = await this.ReportService.generateReport(
                seller.id,
                'daily'
            )
        }

        const admins = await this.userRepository.find({
            where : {
                role: {
                    name: 'admin'
                }
            }
        })

        for (const admin of admins){
            const csv = await this.ReportService.generateReport(
                admin.id,
                'daily'
            )
        }
    }

    
}
