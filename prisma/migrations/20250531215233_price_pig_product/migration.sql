/*
  Warnings:

  - Added the required column `price` to the `PigProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PigProduct` ADD COLUMN `price` DECIMAL(10, 3) NOT NULL;
