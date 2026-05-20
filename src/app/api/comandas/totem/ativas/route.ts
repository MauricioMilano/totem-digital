import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const comandas = await prisma.comanda.findMany({
      where: {
        status: "ABERTA",
      },
      include: {
        cliente: true,
        itens: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals and format
    const formatted = comandas.map(c => ({
      id: c.id,
      total: Number(c.total),
      createdAt: c.createdAt,
      cliente: c.cliente ? {
        id: c.cliente.id,
        nome: c.cliente.nome,
        cpf: c.cliente.cpf,
      } : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erro ao buscar comandas ativas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
