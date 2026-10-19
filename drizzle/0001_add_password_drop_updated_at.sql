ALTER TABLE `users` ADD `password` varchar(255) NOT NULL;
ALTER TABLE `users` DROP COLUMN `updated_at`;
