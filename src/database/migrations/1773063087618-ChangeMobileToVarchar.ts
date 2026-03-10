import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeMobileToVarchar1773063087618 implements MigrationInterface {
  name = "ChangeMobileToVarchar1773063087618";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_29fd51e9cf9241d022c5a4e02e6"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mobile"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "mobile" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_29fd51e9cf9241d022c5a4e02e6" UNIQUE ("mobile")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_29fd51e9cf9241d022c5a4e02e6"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mobile"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "mobile" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_29fd51e9cf9241d022c5a4e02e6" UNIQUE ("mobile")`,
    );
  }
}
