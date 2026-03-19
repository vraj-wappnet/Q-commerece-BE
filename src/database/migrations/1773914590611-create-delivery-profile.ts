import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDeliveryProfile1773914590611 implements MigrationInterface {
    name = 'CreateDeliveryProfile1773914590611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "delivery_profile" ("id" SERIAL NOT NULL, "vehicleType" character varying NOT NULL, "vehicleName" character varying NOT NULL, "rcBookPhoto" character varying NOT NULL, "licensePhoto" character varying NOT NULL, "addressLine1" character varying NOT NULL, "addressLine2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "pincode" character varying NOT NULL, "location" character varying, "latitude" numeric, "longitude" numeric, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_46eec824b778f53970d60c9a8a" UNIQUE ("userId"), CONSTRAINT "PK_ab96c2d858fbead971327377abd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "delivery_profile" ADD CONSTRAINT "FK_46eec824b778f53970d60c9a8ac" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery_profile" DROP CONSTRAINT "FK_46eec824b778f53970d60c9a8ac"`);
        await queryRunner.query(`DROP TABLE "delivery_profile"`);
    }

}
