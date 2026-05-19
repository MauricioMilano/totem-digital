import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategoriaServico } from "@prisma/client";

export async function GET() {
  const servicos = await prisma.servico.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(servicos);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descricao, categoria, preco, duracaoMin } = body;

    if (!nome || !preco) {
      return NextResponse.json(
        { error: "Nome e preço são obrigatórios" },
        { status: 400 }
      );
    }

    const servico = await prisma.servico.create({
      data: {
        nome,
        descricao,
        categoria: categoria as CategoriaServico || "CORTE",
        preco: parseFloat(preco),
        duracaoMin: duracaoMin || 30,
      },
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
