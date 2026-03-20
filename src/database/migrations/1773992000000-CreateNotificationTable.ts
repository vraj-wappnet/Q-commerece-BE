import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationTable1773992000000 implements MigrationInterface {
    name = 'CreateNotificationTable1773992000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create notification_type enum
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('1', '2')`);
        
        // Create notification table
        await queryRunner.query(`
            CREATE TABLE "notification" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "message" character varying NOT NULL,
                "type" "public"."notification_type_enum" NOT NULL,
                "isRead" boolean NOT NULL,
                "createdAt" TIMESTAMP NOT NULL,
                "userId" uuid,
                CONSTRAINT "PK_notification_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_notification_userId" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        
        // Create index for better performance
        await queryRunner.query(`CREATE INDEX "IDX_notification_userId" ON "notification" ("userId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_userId"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    }
}
