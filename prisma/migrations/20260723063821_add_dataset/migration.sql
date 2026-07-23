-- CreateTable
CREATE TABLE `datasets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(500) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `excerpt` TEXT NULL,
    `cover_image` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'shi',
    `domain` VARCHAR(191) NULL,
    `license` ENUM('cc0', 'cc_by', 'cc_by_sa', 'cc_by_nc', 'mit', 'apache2', 'custom') NOT NULL DEFAULT 'cc_by',
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `num_examples` INTEGER NOT NULL DEFAULT 0,
    `size_in_mb` DOUBLE NOT NULL DEFAULT 0,
    `num_downloads` INTEGER NOT NULL DEFAULT 0,
    `download_type` ENUM('direct', 'external', 'both') NOT NULL DEFAULT 'external',
    `download_url` VARCHAR(191) NULL,
    `file_url` VARCHAR(191) NULL,
    `file_public_id` VARCHAR(191) NULL,
    `format` VARCHAR(191) NULL,
    `version` VARCHAR(191) NOT NULL DEFAULT '1.0.0',
    `preview_data` JSON NULL,
    `bibtex` TEXT NULL,
    `author_id` INTEGER NOT NULL,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `datasets_slug_key`(`slug`),
    INDEX `datasets_slug_idx`(`slug`),
    INDEX `datasets_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `datasets` ADD CONSTRAINT `datasets_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
