import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePaymentTransactionsTable1774419000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "payment_transactions",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "orderId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "paymentIntentId",
                        type: "varchar",
                        length: "255",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "amount",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "currency",
                        type: "varchar",
                        length: "10",
                        default: "'INR'",
                    },
                    {
                        name: "status",
                        type: "int",
                        default: 1,
                    },
                    {
                        name: "paymentMethod",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name: "paymentMethodId",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "transactionDate",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "stripeResponse",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "failureReason",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            "payment_transactions",
            new TableForeignKey({
                columnNames: ["orderId"],
                referencedColumnNames: ["id"],
                referencedTableName: "order",
                onDelete: "CASCADE",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("payment_transactions");
        if (table) {
            const foreignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf("orderId") !== -1,
            );
            if (foreignKey) {
                await queryRunner.dropForeignKey("payment_transactions", foreignKey);
            }
        }
        await queryRunner.dropTable("payment_transactions");
    }
}
