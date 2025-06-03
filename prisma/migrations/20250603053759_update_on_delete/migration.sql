-- DropForeignKey
ALTER TABLE `PigProduct` DROP FOREIGN KEY `PigProduct_pigId_fkey`;

-- DropForeignKey
ALTER TABLE `PigProduct` DROP FOREIGN KEY `PigProduct_productId_fkey`;

-- DropIndex
DROP INDEX `PigProduct_pigId_fkey` ON `PigProduct`;

-- DropIndex
DROP INDEX `PigProduct_productId_fkey` ON `PigProduct`;

-- AddForeignKey
ALTER TABLE `PigProduct` ADD CONSTRAINT `PigProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PigProduct` ADD CONSTRAINT `PigProduct_pigId_fkey` FOREIGN KEY (`pigId`) REFERENCES `Pig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
