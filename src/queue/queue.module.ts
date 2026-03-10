import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailModule } from "src/mail/mail.module";
import { MailProcessor } from "./mail.processor";

@Module({
    imports: [
        BullModule.registerQueue({
            name: "emailQueue",
        }),
        MailModule
    ],
    providers: [MailProcessor]
})

export class QueueModule { }