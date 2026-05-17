import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const comandas = await prisma.comanda.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      cliente: true,
      usuario: { select: { id: true, nome: true } },
      formaPagamento: true,
      itens: {
        include: {
          servico: true,
          bebida: true,
          produto: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(comandas);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clienteId,
      itens,
      formaPagamentoId,
      quantidadeParcelas,
    } = body;

    if (!clienteId || !itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { error: "Cliente e itens são obrigatórios" },
        { status: 400 }
      );
    }

    // Calcular total
    let total = 0;
    const itensData = itens.map((item: any) => {
      const precoUnit = parseFloat(item.precoUnit);
      const quantidade = item.quantidade || 1;
      const totalItem = precoUnit * quantidade;
      total += totalItem;

      return {
        nomeItem: item.nomeItem,
        precoUnit,
        quantidade,
        total: totalItem,
        servicoId: item.servicoId || null,
        bebidaId: item.bebidaId || null,
        produtoId: item.produtoId || null,
      };
    });

    const comanda = await prisma.comanda.create({
      data: {
        clienteId,
        formaPagamentoId: formaPagamentoId || null,
        quantidadeParcelas: quantidadeParcelas || 1,
        total,
        itens: {
          create: itensData,
        },
      },
      include: {
        cliente: true,
        formaPagamento: true,
        itens: {
          include: {
            servico: true,
            bebida: true,
            produto: true,
          },
        },
      },
    });

    return NextResponse.json(comanda, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar comanda:", error);
    return NextResponse.json(
      { error: "Erro ao criar comanda" },
      { status: 500 }
    );
  }
}
