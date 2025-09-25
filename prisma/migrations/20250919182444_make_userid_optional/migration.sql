-- DropForeignKey
ALTER TABLE "public"."Store" DROP CONSTRAINT "Store_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Store" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "logo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Store" ADD CONSTRAINT "Store_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
