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
        status: "ABERTA",
        fechadaEm: null,
      },
    });

    return NextResponse.json(comanda);
  } catch (error) {
    console.error("Erro ao reabrir comanda:", error);
    return NextResponse.json(
      { error: "Erro ao reabrir comanda" },
      { status: 500 }
    );
  }
}
