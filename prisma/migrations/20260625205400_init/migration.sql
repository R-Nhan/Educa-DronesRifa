-- CreateTable
CREATE TABLE `Vendedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `totalVendas` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RifaNumero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` INTEGER NOT NULL,
    `vendido` BOOLEAN NOT NULL DEFAULT false,
    `comprador` VARCHAR(191) NULL,
    `cpfComprador` VARCHAR(191) NULL,
    `telefoneComprador` VARCHAR(191) NULL,
    `cidadeComprador` VARCHAR(191) NULL,
    `vendedorId` INTEGER NULL,
    `dataVenda` DATETIME(3) NULL,

    UNIQUE INDEX `RifaNumero_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RifaNumero` ADD CONSTRAINT `RifaNumero_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `Vendedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
