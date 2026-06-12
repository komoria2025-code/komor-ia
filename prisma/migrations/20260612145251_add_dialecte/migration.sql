-- AlterTable
ALTER TABLE `translations` ADD COLUMN `dialecte` ENUM('shingazidja', 'shindzuani', 'shimwali', 'shimaore') NOT NULL DEFAULT 'shingazidja';
