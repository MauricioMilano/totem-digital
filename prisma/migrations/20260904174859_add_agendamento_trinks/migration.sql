-- CreateTable
CREATE TABLE "AgendamentoTrinks" (
    "id" TEXT NOT NULL,
    "trinksId" INTEGER NOT NULL,
    "clienteCpf" TEXT,
    "clienteNome" TEXT,
    "clienteTrinksId" INTEGER,
    "profissionalId" INTEGER,
    "servicoNome" TEXT,
    "precoServico" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "duracaoMin" INTEGER,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "origem" TEXT,
    "observacao" TEXT,
    "comandaId" TEXT,
    "historico" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendamentoTrinks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgendamentoTrinks_trinksId_key" ON "AgendamentoTrinks"("trinksId");

-- CreateIndex
CREATE UNIQUE INDEX "AgendamentoTrinks_comandaId_key" ON "AgendamentoTrinks"("comandaId");

-- CreateIndex
CREATE INDEX "AgendamentoTrinks_clienteCpf_idx" ON "AgendamentoTrinks"("clienteCpf");

-- CreateIndex
CREATE INDEX "AgendamentoTrinks_dataInicio_idx" ON "AgendamentoTrinks"("dataInicio");

-- AddForeignKey
ALTER TABLE "AgendamentoTrinks" ADD CONSTRAINT "AgendamentoTrinks_comandaId_fkey" FOREIGN KEY ("comandaId") REFERENCES "Comanda"("id") ON DELETE SET NULL ON UPDATE CASCADE;
