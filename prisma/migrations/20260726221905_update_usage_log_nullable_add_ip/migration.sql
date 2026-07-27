-- AlterTable
ALTER TABLE `usage_logs` ADD COLUMN `ip_address` VARCHAR(191) NULL,
    MODIFY `user_id` INTEGER NULL,
    MODIFY `api_key_id` INTEGER NULL,
    MODIFY `modele_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `usage_logs_ip_address_idx` ON `usage_logs`(`ip_address`);
