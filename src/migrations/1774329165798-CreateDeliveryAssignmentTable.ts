import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDeliveryAssignmentTable1774329165798 implements MigrationInterface {
    name = 'CreateDeliveryAssignmentTable1774329165798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create AssignmentStatus enum
        await queryRunner.query(`
            CREATE TYPE "public"."assignment_status_enum" AS ENUM('1', '2', '3', '4')
        `);

        // Create delivery_assignments table
        await queryRunner.query(`
            CREATE TABLE "delivery_assignments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" "public"."assignment_status_enum" NOT NULL DEFAULT '1',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "orderId" integer,
                "userId" integer,
                CONSTRAINT "PK_delivery_assignments" PRIMARY KEY ("id"),
                CONSTRAINT "FK_delivery_assignments_order" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_delivery_assignments_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_delivery_assignments_orderId" ON "delivery_assignments" ("orderId")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_delivery_assignments_userId" ON "delivery_assignments" ("userId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_delivery_assignments_userId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_delivery_assignments_orderId"`);
        await queryRunner.query(`DROP TABLE "delivery_assignments"`);
        await queryRunner.query(`DROP TYPE "public"."assignment_status_enum"`);
    }
}
