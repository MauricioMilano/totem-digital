-- DropForeignKey
ALTER TABLE "Comanda" DROP CONSTRAINT "Comanda_clienteId_fkey";

-- AlterTable
ALTER TABLE "Comanda" ALTER COLUMN "clienteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
