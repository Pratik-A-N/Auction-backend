/*
  Warnings:

  - You are about to drop the column `userId` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `highestBidUserId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_highestBidUserId_fkey";

-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "highestBidUserId",
ADD COLUMN     "highestBidUserName" TEXT;

-- DropTable
DROP TABLE "User";
