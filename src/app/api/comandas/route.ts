import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveItemPrices, validateAndDecrementStock } from "@/lib/comandas-utils";

// Characters without ambiguous ones (0/O, 1/I/L) so guests can read them aloud.
const RECIBO_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCodigoRecibo(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += RECIBO_ALPHABET[Math.floor(Math.random() * RECIBO_ALPHABET.length)];
  }
  return code;
}

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

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { error: "Itens são obrigatórios" },
        { status: 400 }
      );
    }

    const itensParsed = itens.map((item: any) => ({
      nomeItem: item.nomeItem,
      precoUnit: parseFloat(item.precoUnit),
      quantidade: item.quantidade || 1,
      servicoId: item.servicoId || null,
      bebidaId: item.bebidaId || null,
      produtoId: item.produtoId || null,
    }));

    const comanda = await prisma.$transaction(async (tx) => {
      const resolvedItens = await resolveItemPrices(tx, itensParsed);

      await validateAndDecrementStock(tx, resolvedItens);

      const total = resolvedItens.reduce((acc, item) => acc + item.total, 0);

      // Guests have no clienteId — give them a receipt code so they can find their comanda later.
      const codigoRecibo = !clienteId ? generateCodigoRecibo() : null;

      return tx.comanda.create({
        data: {
          clienteId,
          codigoRecibo,
          formaPagamentoId: formaPagamentoId || null,
          quantidadeParcelas: quantidadeParcelas || 1,
          total,
          itens: {
            create: resolvedItens.map((item) => ({
              nomeItem: item.nomeItem,
              precoUnit: item.precoUnit,
              quantidade: item.quantidade,
              total: item.total,
              servicoId: item.servicoId,
              bebidaId: item.bebidaId,
              produtoId: item.produtoId,
            })),
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
    });

    return NextResponse.json(comanda, { status: 201 });
  } catch (error: any) {
    if (error.message && error.message.startsWith("Estoque insuficiente")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Erro ao criar comanda:", error);
    return NextResponse.json(
      { error: "Erro ao criar comanda" },
      { status: 500 }
    );
  }
}
