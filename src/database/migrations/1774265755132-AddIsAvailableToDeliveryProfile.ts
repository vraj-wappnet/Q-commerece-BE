import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsAvailableToDeliveryProfile1774265755132 implements MigrationInterface {
    name = 'AddIsAvailableToDeliveryProfile1774265755132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_notification_userId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_userId"`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ADD "isAvailable" boolean DEFAULT true`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_enum" RENAME TO "order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('1', '2', '3', '4', '5', '6', '7')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum" USING "status"::"text"::"public"."order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT '1'`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum_old" AS ENUM('1', '2', '3', '4', '5', '6')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum_old" USING "status"::"text"::"public"."order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT '1'`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_enum_old" RENAME TO "order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" DROP COLUMN "isAvailable"`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_userId" ON "notification" ("userId") `);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_notification_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
