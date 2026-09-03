-- Convert Servico.categoria (enum) to a CategoriaServico table (espelha CategoriaBebida/CategoriaProduto).
-- O Postgres não permite criar tabela com o mesmo nome de um tipo existente,
-- então o backfill roda antes da remoção do enum.

-- Step 1: coluna nova nullable
ALTER TABLE "Servico" ADD COLUMN "categoriaId" TEXT;

-- Step 2: backfill dos serviços existentes mapeando o enum para as ids fixas das novas categorias
UPDATE "Servico" SET "categoriaId" = CASE "categoria"
    WHEN 'CORTE' THEN 'cs-corte'
    WHEN 'BARBA' THEN 'cs-barba'
    WHEN 'HIDRATACAO' THEN 'cs-hidratacao'
    WHEN 'SOBRANCELHA' THEN 'cs-sobrancelha'
    WHEN 'COMBO' THEN 'cs-combo'
    WHEN 'OUTRO' THEN 'cs-outros'
END;

-- Step 3: NOT NULL + índice, remover coluna de enum e o tipo
ALTER TABLE "Servico" ALTER COLUMN "categoriaId" SET NOT NULL;
CREATE INDEX "Servico_categoriaId_idx" ON "Servico"("categoriaId");
ALTER TABLE "Servico" DROP COLUMN "categoria";
DROP TYPE "CategoriaServico";

-- Step 4: tabela de categorias (libera o nome do tipo) + dados iniciais
CREATE TABLE "CategoriaServico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CategoriaServico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaServico_nome_key" ON "CategoriaServico"("nome");

INSERT INTO "CategoriaServico" ("id", "nome", "descricao", "sortOrder") VALUES
    ('cs-corte', 'Cortes', 'Cortes de cabelo', 1),
    ('cs-barba', 'Barba', 'Serviços de barba', 2),
    ('cs-hidratacao', 'Hidratação', 'Tratamentos e hidratação', 3),
    ('cs-sobrancelha', 'Sobrancelha', 'Design de sobrancelha', 4),
    ('cs-combo', 'Combos', 'Combinações de serviços', 5),
    ('cs-outros', 'Outros', 'Demais serviços', 6);

-- AddForeignKey
ALTER TABLE "Servico" ADD CONSTRAINT "Servico_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
