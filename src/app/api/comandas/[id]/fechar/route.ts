import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const comanda = await prisma.comanda.update({
      where: { id },
      data: {
        status: "FECHADA",
        fechadaEm: new Date(),
        usuarioId: session.user.id,
      },
      include: {
        cliente: true,
        formaPagamento: true,
        itens: true,
      },
    });

    return NextResponse.json(comanda);
  } catch (error) {
    console.error("Erro ao fechar comanda:", error);
    return NextResponse.json(
      { error: "Erro ao fechar comanda" },
      { status: 500 }
    );
  }
}
