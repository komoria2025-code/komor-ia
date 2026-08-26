-- AlterTable
ALTER TABLE `point_transactions`
  ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'site',
  ADD COLUMN `admin_note` TEXT NULL,
  ADD COLUMN `validated_by` INTEGER NULL;

-- CreateIndex
CREATE INDEX `point_transactions_source_idx` ON `point_transactions`(`source`);