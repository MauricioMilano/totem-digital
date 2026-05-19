import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

      let addedTotal = 0;
      const itensData = itens.map((item: any) => {
        const precoUnit = parseFloat(item.precoUnit);
        const quantidade = item.quantidade || 1;
        const totalItem = precoUnit * quantidade;
        addedTotal += totalItem;

        return {
          nomeItem: item.nomeItem,
          precoUnit,
          quantidade,
          total: totalItem,
          servicoId: item.servicoId || null,
          bebidaId: item.bebidaId || null,
          produtoId: item.produtoId || null,
          comandaId: id,
        };
      });

      await tx.itemComanda.createMany({
        data: itensData,
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
    console.error("Erro ao adicionar itens à comanda:", error);
    return NextResponse.json({ error: "Erro interno ao adicionar itens" }, { status: 500 });
  }
}
