import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUserRoleToInt1773729476570 implements MigrationInterface {
  name = "ChangeUserRoleToInt1773729476570";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Guardrail: fail fast if there are unexpected role values in existing data.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM "user"
          WHERE ("role"::text) NOT IN ('admin', 'seller', 'delivery', 'customer')
        ) THEN
          RAISE EXCEPTION 'Unknown values found in user.role';
        END IF;
      END $$;
    `);

    // Convert from old enum/text values to numeric codes.
    await queryRunner.query(`
      ALTER TABLE "user"
      ALTER COLUMN "role" TYPE smallint
      USING (
        CASE ("role"::text)
          WHEN 'admin' THEN 1
          WHEN 'seller' THEN 2
          WHEN 'delivery' THEN 3
          WHEN 'customer' THEN 4
        END
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Best-effort rollback (back to text). Recreating a postgres enum type is intentionally avoided here.
    await queryRunner.query(`
      ALTER TABLE "user"
      ALTER COLUMN "role" TYPE text
      USING (
        CASE "role"
          WHEN 1 THEN 'admin'
          WHEN 2 THEN 'seller'
          WHEN 3 THEN 'delivery'
          WHEN 4 THEN 'customer'
          ELSE NULL
        END
      );
    `);
  }
}
