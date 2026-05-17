import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const comandas = await prisma.comanda.findMany({
    where: {
      OR: [
        { status: "ABERTA" },
        { status: "EM_ANDAMENTO" },
      ],
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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comandas);
}
