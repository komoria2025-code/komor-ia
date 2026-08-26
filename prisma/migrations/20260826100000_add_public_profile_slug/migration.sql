-- AlterTable
ALTER TABLE `profils` ADD COLUMN `public_slug` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `profils_public_slug_key` ON `profils`(`public_slug`);