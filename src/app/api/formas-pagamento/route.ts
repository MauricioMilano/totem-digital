import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const todas = searchParams.get("todas") === "true";

  const formas = await prisma.formaPagamento.findMany({
    where: todas ? {} : { ativo: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(formas);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descricao, permiteParcelamento, maximoParcelas } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const forma = await prisma.formaPagamento.create({
      data: {
        nome,
        descricao,
        permiteParcelamento: permiteParcelamento || false,
        maximoParcelas: maximoParcelas || 1,
      },
    });

    return NextResponse.json(forma, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar forma de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar forma de pagamento" },
      { status: 500 }
    );
  }
}
