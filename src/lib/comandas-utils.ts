import { PrismaClient, Prisma } from "@prisma/client";

type PrismaTx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

interface ItemInput {
  nomeItem: string;
  precoUnit: number;
  quantidade: number;
  servicoId?: string | null;
  bebidaId?: string | null;
  produtoId?: string | null;
}

interface ResolvedItem extends ItemInput {
  total: number;
}

export async function resolveItemPrices(
  tx: PrismaTx,
  itens: ItemInput[]
): Promise<ResolvedItem[]> {
  const servicoIds = itens
    .filter((i) => i.servicoId)
    .map((i) => i.servicoId!);
  const bebidaIds = itens
    .filter((i) => i.bebidaId)
    .map((i) => i.bebidaId!);
  const produtoIds = itens
    .filter((i) => i.produtoId)
    .map((i) => i.produtoId!);

  const [servicos, bebidas, produtos] = await Promise.all([
    servicoIds.length > 0
      ? tx.servico.findMany({
          where: { id: { in: servicoIds } },
          select: { id: true, preco: true },
        })
      : [],
    bebidaIds.length > 0
      ? tx.bebida.findMany({
          where: { id: { in: bebidaIds } },
          select: { id: true, preco: true },
        })
      : [],
    produtoIds.length > 0
      ? tx.produto.findMany({
          where: { id: { in: produtoIds } },
          select: { id: true, preco: true },
        })
      : [],
  ]);

  const servicoMap = new Map(servicos.map((s) => [s.id, Number(s.preco)]));
  const bebidaMap = new Map(bebidas.map((b) => [b.id, Number(b.preco)]));
  const produtoMap = new Map(produtos.map((p) => [p.id, Number(p.preco)]));

  return itens.map((item) => {
    let precoUnit = item.precoUnit;

    if (item.servicoId && servicoMap.has(item.servicoId)) {
      precoUnit = servicoMap.get(item.servicoId)!;
    } else if (item.bebidaId && bebidaMap.has(item.bebidaId)) {
      precoUnit = bebidaMap.get(item.bebidaId)!;
    } else if (item.produtoId && produtoMap.has(item.produtoId)) {
      precoUnit = produtoMap.get(item.produtoId)!;
    }

    const total = precoUnit * item.quantidade;

    return { ...item, precoUnit, total };
  });
}

export async function validateAndDecrementStock(
  tx: PrismaTx,
  itens: ItemInput[]
): Promise<void> {
  const productItems = itens.filter((i) => i.produtoId);

  if (productItems.length === 0) return;

  const produtoIds = [...new Set(productItems.map((i) => i.produtoId!))];

  const produtos = await tx.produto.findMany({
    where: { id: { in: produtoIds } },
    select: { id: true, quantidade: true },
  });

  const produtoMap = new Map(produtos.map((p) => [p.id, p.quantidade]));

  for (const item of productItems) {
    const estoqueAtual = produtoMap.get(item.produtoId!) ?? 0;
    if (estoqueAtual < item.quantidade) {
      throw new Error(`Estoque insuficiente para o produto ${item.produtoId}`);
    }
  }

  for (const item of productItems) {
    await tx.produto.update({
      where: { id: item.produtoId! },
      data: { quantidade: { decrement: item.quantidade } },
    });
  }
}
