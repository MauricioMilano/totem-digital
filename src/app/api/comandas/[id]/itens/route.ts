import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveItemPrices, validateAndDecrementStock } from "@/lib/comandas-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itens } = body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json({ error: "Itens são obrigatórios" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const comanda = await tx.comanda.findUnique({
        where: { id },
      });

      if (!comanda) {
        throw new Error("Comanda não encontrada");
      }

      if (comanda.status !== 'ABERTA') {
        throw new Error("Apenas comandas abertas podem receber novos itens");
      }

      const itensParsed = itens.map((item: any) => ({
        nomeItem: item.nomeItem,
        precoUnit: parseFloat(item.precoUnit),
        quantidade: item.quantidade || 1,
        servicoId: item.servicoId || null,
        bebidaId: item.bebidaId || null,
        produtoId: item.produtoId || null,
      }));

      const resolvedItens = await resolveItemPrices(tx, itensParsed);

      await validateAndDecrementStock(tx, resolvedItens);

      const addedTotal = resolvedItens.reduce((acc, item) => acc + item.total, 0);

      await tx.itemComanda.createMany({
        data: resolvedItens.map((item) => ({
          nomeItem: item.nomeItem,
          precoUnit: item.precoUnit,
          quantidade: item.quantidade,
          total: item.total,
          servicoId: item.servicoId,
          bebidaId: item.bebidaId,
          produtoId: item.produtoId,
          comandaId: id,
        })),
      });

      const updatedComanda = await tx.comanda.update({
        where: { id },
        data: {
          total: {
            increment: addedTotal,
          },
        },
      });

      return updatedComanda;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "Comanda não encontrada" || error.message === "Apenas comandas abertas podem receber novos itens") {
       return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message && error.message.startsWith("Estoque insuficiente")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Erro ao adicionar itens à comanda:", error);
    return NextResponse.json({ error: "Erro interno ao adicionar itens" }, { status: 500 });
  }
}
