-- CreateTable
CREATE TABLE "Vendedor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "totalVendas" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Vendedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RifaNumero" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "vendido" BOOLEAN NOT NULL DEFAULT false,
    "comprador" TEXT,
    "cpfComprador" TEXT,
    "telefoneComprador" TEXT,
    "cidadeComprador" TEXT,
    "vendedorId" INTEGER,
    "dataVenda" TIMESTAMP(3),

    CONSTRAINT "RifaNumero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RifaNumero_numero_key" ON "RifaNumero"("numero");

-- AddForeignKey
ALTER TABLE "RifaNumero" ADD CONSTRAINT "RifaNumero_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
