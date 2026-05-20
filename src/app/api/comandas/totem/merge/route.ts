import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { comandaId, itens } = await request.json();

    if (!comandaId || !itens || !Array.isArray(itens)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Process merge in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of itens) {
        await tx.itemComanda.create({
          data: {
            comandaId,
            nomeItem: item.nomeItem,
            precoUnit: item.precoUnit,
            quantidade: item.quantidade,
            total: item.precoUnit * item.quantidade,
            servicoId: item.tipo === "servico" ? item.id : null,
            bebidaId: item.tipo === "bebida" ? item.id : null,
            produtoId: item.tipo === "produto" ? item.id : null,
          },
        });
      }

      // Update comanda total
      const allItens = await tx.itemComanda.findMany({
        where: { comandaId },
      });
      const newTotal = allItens.reduce((acc, i) => acc + Number(i.total), 0);

      await tx.comanda.update({
        where: { id: comandaId },
        data: { total: newTotal },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao mesclar comanda:", error);
    return NextResponse.json({ error: "Erro interno ao mesclar" }, { status: 500 });
  }
}
