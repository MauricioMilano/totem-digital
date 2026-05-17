import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comanda = await prisma.comanda.update({
      where: { id },
      data: {
        status: "PAGA",
        pagaEm: new Date(),
      },
      include: {
        cliente: true,
        formaPagamento: true,
        itens: true,
      },
    });

    return NextResponse.json(comanda);
  } catch (error) {
    console.error("Erro ao pagar comanda:", error);
    return NextResponse.json(
      { error: "Erro ao pagar comanda" },
      { status: 500 }
    );
  }
}
