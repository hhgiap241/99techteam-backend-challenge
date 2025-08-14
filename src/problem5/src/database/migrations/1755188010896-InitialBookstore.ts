import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialBookstore1755188010896 implements MigrationInterface {
    name = 'InitialBookstore1755188010896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."books_category_enum" AS ENUM('fiction', 'science', 'technology')`);
        await queryRunner.query(`CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "author" character varying(255) NOT NULL, "description" text NOT NULL, "category" "public"."books_category_enum" NOT NULL DEFAULT 'fiction', "price" numeric(10,2) NOT NULL, "stockQuantity" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4675aad2c57a7a793d26afbae9" ON "books" ("author") `);
        await queryRunner.query(`CREATE INDEX "IDX_3cd818eaf734a9d8814843f119" ON "books" ("title") `);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "bookId" uuid NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0101724ac3b11e85922928ab86" ON "order_items" ("bookId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f1d359a55923bb45b057fbdab0" ON "order_items" ("orderId") `);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('processing', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'processing', "totalAmount" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_151b79a83ba240b0cb31b2302d" ON "orders" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_0101724ac3b11e85922928ab86e" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_0101724ac3b11e85922928ab86e"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_151b79a83ba240b0cb31b2302d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_775c9f06fc27ae3ff8fb26f2c4"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f1d359a55923bb45b057fbdab0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0101724ac3b11e85922928ab86"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3cd818eaf734a9d8814843f119"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4675aad2c57a7a793d26afbae9"`);
        await queryRunner.query(`DROP TABLE "books"`);
        await queryRunner.query(`DROP TYPE "public"."books_category_enum"`);
    }

}
