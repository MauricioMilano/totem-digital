import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoriaId = searchParams.get("categoriaId");

  const produtos = await prisma.produto.findMany({
    where: {
      ativo: true,
      ...(categoriaId ? { categoriaId } : {}),
    },
    include: { categoria: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(produtos);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descricao, preco, categoriaId, quantidade, imagem } = body;

    if (!nome || !preco || !categoriaId) {
      return NextResponse.json(
        { error: "Nome, preço e categoria são obrigatórios" },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoriaId,
        quantidade: quantidade ? parseInt(quantidade) : 0,
        imagem: imagem || null,
      },
      include: { categoria: true },
    });

    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
