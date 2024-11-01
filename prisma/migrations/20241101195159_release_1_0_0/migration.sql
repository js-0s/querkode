-- CreateTable
CREATE TABLE `DynamicUrl` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `destination` TEXT NOT NULL,

    UNIQUE INDEX `DynamicUrl_key_key`(`key`),
    INDEX `DynamicUrl_key_idx`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Statistics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `urlId` VARCHAR(191) NOT NULL,
    `rawHeaders` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `ua` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Statistics` ADD CONSTRAINT `Statistics_urlId_fkey` FOREIGN KEY (`urlId`) REFERENCES `DynamicUrl`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
