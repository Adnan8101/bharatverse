/*
  Warnings:

  - You are about to drop the column `country` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Address` table. All the data in the column will be lost.
  - Added the required column `pincode` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- First add the pincode column with a default value
ALTER TABLE "public"."Address" ADD COLUMN "pincode" TEXT NOT NULL DEFAULT '';

-- Copy data from zip to pincode
UPDATE "public"."Address" SET "pincode" = "zip";

-- Drop the old columns
ALTER TABLE "public"."Address" DROP COLUMN "country",
DROP COLUMN "email",
DROP COLUMN "zip";
