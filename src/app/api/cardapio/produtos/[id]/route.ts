import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome: body.nome,
        descricao: body.descricao,
        preco: body.preco ? parseFloat(body.preco) : undefined,
        categoriaId: body.categoriaId,
        quantidade: body.quantidade ? parseInt(body.quantidade) : undefined,
        ativo: body.ativo,
      },
      include: { categoria: true },
    });

    return NextResponse.json(produto);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao desativar produto:", error);
    return NextResponse.json(
      { error: "Erro ao desativar produto" },
      { status: 500 }
    );
  }
}
