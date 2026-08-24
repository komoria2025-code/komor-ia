-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('admin', 'user', 'developer', 'journaliste', 'translator', 'linguiste', 'partner') NOT NULL DEFAULT 'user';
