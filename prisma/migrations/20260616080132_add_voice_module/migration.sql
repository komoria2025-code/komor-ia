-- CreateTable
CREATE TABLE `voice_phrases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` TEXT NOT NULL,
    `dialecte` ENUM('shingazidja', 'shindzuani', 'shimwali', 'shimaore') NOT NULL DEFAULT 'shingazidja',
    `translation` TEXT NULL,
    `difficulty` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('active', 'inactive', 'completed') NOT NULL DEFAULT 'active',
    `max_recordings` INTEGER NOT NULL DEFAULT 3,
    `recording_count` INTEGER NOT NULL DEFAULT 0,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `voice_phrases_status_idx`(`status`),
    INDEX `voice_phrases_dialecte_idx`(`dialecte`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voice_recordings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phrase_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `audio_url` VARCHAR(191) NOT NULL,
    `public_id` VARCHAR(191) NOT NULL,
    `duration` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('pending', 'validated', 'rejected') NOT NULL DEFAULT 'pending',
    `dialecte` ENUM('shingazidja', 'shindzuani', 'shimwali', 'shimaore') NOT NULL DEFAULT 'shingazidja',
    `genre` ENUM('homme', 'femme', 'autre') NULL,
    `tranche_age` ENUM('moins18', 'age18_25', 'age26_35', 'age36_50', 'plus50') NULL,
    `zone` ENUM('urbain', 'rural') NULL,
    `ile` ENUM('grande_comore', 'anjouan', 'moheli', 'mayotte', 'diaspora') NULL,
    `native_speaker` BOOLEAN NOT NULL DEFAULT true,
    `validated_by` INTEGER NULL,
    `validated_at` DATETIME(3) NULL,
    `reject_reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `voice_recordings_phrase_id_idx`(`phrase_id`),
    INDEX `voice_recordings_user_id_idx`(`user_id`),
    INDEX `voice_recordings_status_idx`(`status`),
    UNIQUE INDEX `voice_recordings_phrase_id_user_id_key`(`phrase_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `voice_phrases` ADD CONSTRAINT `voice_phrases_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voice_recordings` ADD CONSTRAINT `voice_recordings_phrase_id_fkey` FOREIGN KEY (`phrase_id`) REFERENCES `voice_phrases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voice_recordings` ADD CONSTRAINT `voice_recordings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
