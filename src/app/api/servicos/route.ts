import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const servicos = await prisma.servico.findMany({
    where: { ativo: true },
    include: { categoria: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(servicos);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descricao, categoriaId, preco, duracaoMin } = body;

    if (!nome || !preco || !categoriaId) {
      return NextResponse.json(
        { error: "Nome, preço e categoria são obrigatórios" },
        { status: 400 }
      );
    }

    const servico = await prisma.servico.create({
      data: {
        nome,
        descricao,
        categoriaId,
        preco: parseFloat(preco),
        duracaoMin: duracaoMin || 30,
      },
      include: { categoria: true },
    });

    return NextResponse.json(servico, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 }
    );
  }
}
