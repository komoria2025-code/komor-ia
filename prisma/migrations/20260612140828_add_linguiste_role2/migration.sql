-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('admin', 'user', 'developer', 'journaliste', 'translator', 'linguiste') NOT NULL DEFAULT 'user';
