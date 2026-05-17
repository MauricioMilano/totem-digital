import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comanda = await prisma.comanda.findUnique({
      where: { id },
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
    });

    if (!comanda) {
      return NextResponse.json(
        { error: "Comanda não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(comanda);
  } catch (error) {
    console.error("Erro ao buscar comanda:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comanda" },
      { status: 500 }
    );
  }
}
