/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `KanbanItem` table. All the data in the column will be lost.
  - Added the required column `title` to the `KanbanItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `KanbanItem` DROP FOREIGN KEY `KanbanItem_assignedToId_fkey`;

-- DropIndex
DROP INDEX `KanbanItem_assignedToId_fkey` ON `KanbanItem`;

-- AlterTable
ALTER TABLE `KanbanColumn` ADD COLUMN `color` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `KanbanItem` DROP COLUMN `assignedToId`,
    ADD COLUMN `color` VARCHAR(191) NULL,
    ADD COLUMN `rowId` INTEGER NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `limit` INTEGER NULL;

-- CreateTable
CREATE TABLE `KanbanRow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `limit` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `color` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_KanbanItemToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_KanbanItemToUser_AB_unique`(`A`, `B`),
    INDEX `_KanbanItemToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KanbanItem` ADD CONSTRAINT `KanbanItem_rowId_fkey` FOREIGN KEY (`rowId`) REFERENCES `KanbanRow`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_KanbanItemToUser` ADD CONSTRAINT `_KanbanItemToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `KanbanItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_KanbanItemToUser` ADD CONSTRAINT `_KanbanItemToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
