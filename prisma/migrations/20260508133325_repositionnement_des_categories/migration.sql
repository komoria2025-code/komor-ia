-- AlterTable
ALTER TABLE `articles` MODIFY `category` ENUM('societe', 'politique', 'economie', 'sport', 'sante', 'education', 'science', 'histoire', 'culture', 'religion', 'actualites', 'litterature', 'autre') NOT NULL DEFAULT 'autre';
