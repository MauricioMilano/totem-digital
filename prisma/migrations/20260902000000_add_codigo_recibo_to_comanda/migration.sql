-- Add guest receipt lookup code to Comanda

ALTER TABLE "Comanda" ADD COLUMN "codigoRecibo" TEXT;

CREATE UNIQUE INDEX "Comanda_codigoRecibo_key" ON "Comanda"("codigoRecibo");
