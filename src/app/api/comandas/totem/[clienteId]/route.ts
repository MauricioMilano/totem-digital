import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params;

    if (clienteId === "guest") {
      return NextResponse.json({ error: "Clientes convidados não possuem comanda persistente" }, { status: 403 });
    }

    const comanda = await prisma.comanda.findFirst({
      where: {
        clienteId,
        status: "ABERTA",
      },
      include: {
        itens: {
          include: {
            servico: true,
            bebida: true,
            produto: true,
          },
        },
        cliente: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!comanda) {
      return NextResponse.json({ error: "Nenhuma comanda aberta encontrada para este cliente" }, { status: 404 });
    }

    return NextResponse.json(comanda);
  } catch (error) {
    console.error("Erro ao buscar comanda ativa do totem:", error);
    return NextResponse.json({ error: "Erro interno ao buscar comanda" }, { status: 500 });
  }
}
