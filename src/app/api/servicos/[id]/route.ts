import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const servico = await prisma.servico.update({
      where: { id },
      data: {
        nome: body.nome,
        descricao: body.descricao,
        categoriaId: body.categoriaId,
        preco: body.preco ? parseFloat(body.preco) : undefined,
        duracaoMin: body.duracaoMin,
        ativo: body.ativo,
      },
      include: { categoria: true },
    });

    return NextResponse.json(servico);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar serviço" },
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
    // Soft delete
    await prisma.servico.update({
      where: { id },
      data: { ativo: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao desativar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao desativar serviço" },
      { status: 500 }
    );
  }
}
