-- AlterTable
ALTER TABLE `articles` ADD COLUMN `content_type` ENUM('article', 'paragraph', 'sentence') NOT NULL DEFAULT 'article';

-- CreateTable
CREATE TABLE `user_gamification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `points` INTEGER NOT NULL DEFAULT 0,
    `total_points` INTEGER NOT NULL DEFAULT 0,
    `level` INTEGER NOT NULL DEFAULT 1,
    `streak` INTEGER NOT NULL DEFAULT 0,
    `max_streak` INTEGER NOT NULL DEFAULT 0,
    `last_active_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_gamification_user_id_key`(`user_id`),
    INDEX `user_gamification_user_id_idx`(`user_id`),
    INDEX `user_gamification_total_points_idx`(`total_points`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `point_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `gamification_id` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `description` VARCHAR(255) NULL,
    `ref_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `point_transactions_user_id_idx`(`user_id`),
    INDEX `point_transactions_gamification_id_idx`(`gamification_id`),
    INDEX `point_transactions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_badges` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `gamification_id` INTEGER NOT NULL,
    `badge` VARCHAR(191) NOT NULL,
    `earned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_badges_user_id_idx`(`user_id`),
    UNIQUE INDEX `user_badges_user_id_badge_key`(`user_id`, `badge`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `articles_content_type_idx` ON `articles`(`content_type`);

-- AddForeignKey
ALTER TABLE `user_gamification` ADD CONSTRAINT `user_gamification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `point_transactions` ADD CONSTRAINT `point_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `point_transactions` ADD CONSTRAINT `point_transactions_gamification_id_fkey` FOREIGN KEY (`gamification_id`) REFERENCES `user_gamification`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_gamification_id_fkey` FOREIGN KEY (`gamification_id`) REFERENCES `user_gamification`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
