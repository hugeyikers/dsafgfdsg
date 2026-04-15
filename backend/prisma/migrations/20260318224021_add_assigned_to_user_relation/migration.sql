/*
  Warnings:

  - The values [MAGAZYNIER,LOGISTYK,DOWODCA] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `KanbanItem` ADD COLUMN `assignedToId` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMINISTRATOR', 'USER') NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE `KanbanItem` ADD CONSTRAINT `KanbanItem_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;