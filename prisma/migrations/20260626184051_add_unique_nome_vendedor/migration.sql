/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Vendedor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Vendedor_nome_key` ON `Vendedor`(`nome`);
