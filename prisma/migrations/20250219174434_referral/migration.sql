/*
  Warnings:

  - The primary key for the `Referral` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Referral` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[referrerId,referredId]` on the table `Referral` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rootUserId` to the `Referral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Referral` table without a default value. This is not possible if the table is not empty.
  - Made the column `referrerId` on table `Referral` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "referred_idx";

-- DropIndex
DROP INDEX "referrer_idx";

-- AlterTable
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_pkey",
ADD COLUMN     "rootUserId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "referrerId" SET NOT NULL,
ADD CONSTRAINT "Referral_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referrerId_referredId_key" ON "Referral"("referrerId", "referredId");
