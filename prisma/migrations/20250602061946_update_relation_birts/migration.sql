/*
  Warnings:

  - A unique constraint covering the columns `[reproductiveHistoryId]` on the table `Birth` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Birth_reproductiveHistoryId_key` ON `Birth`(`reproductiveHistoryId`);
