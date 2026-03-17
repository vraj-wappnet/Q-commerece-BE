import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateShopsTable1773728801502 implements MigrationInterface {
  name = "CreateShopsTable1773728801502";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "shop" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "shopName" character varying NOT NULL, "addressLine1" character varying NOT NULL, "addressLine2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "pinCode" character varying NOT NULL, "country" character varying NOT NULL DEFAULT 'India', "pickupAddress" character varying, "gstNumber" character varying NOT NULL, "panNumber" character varying NOT NULL, "businessRegistrationNumber" character varying, "fssaiNumber" character varying, "accountHolderName" character varying NOT NULL, "accountNumber" character varying NOT NULL, "ifscCode" character varying NOT NULL, "bankName" character varying NOT NULL, "cancelledChequeImage" character varying, "alternatePhone" character varying, "whatsappNumber" character varying, "websiteUrl" character varying, "instagram" character varying, "facebook" character varying, "sellerId" uuid, CONSTRAINT "REL_093e18620bef436b3a6ac05fb8" UNIQUE ("sellerId"), CONSTRAINT "PK_ad47b7c6121fe31cb4b05438e44" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop" ADD CONSTRAINT "FK_093e18620bef436b3a6ac05fb89" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shop" DROP CONSTRAINT "FK_093e18620bef436b3a6ac05fb89"`,
    );
    await queryRunner.query(`DROP TABLE "shop"`);
  }
}
