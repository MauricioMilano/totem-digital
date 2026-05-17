import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const forma = await prisma.formaPagamento.findUnique({
      where: { id },
    });

    if (!forma) {
      return NextResponse.json(
        { error: "Forma de pagamento não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(forma);
  } catch (error) {
    console.error("Erro ao buscar forma de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar forma de pagamento" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const forma = await prisma.formaPagamento.update({
      where: { id },
      data: {
        nome: body.nome,
        descricao: body.descricao,
        permiteParcelamento: body.permiteParcelamento,
        maximoParcelas: body.maximoParcelas ? parseInt(body.maximoParcelas) : undefined,
        ativo: body.ativo,
      },
    });

    return NextResponse.json(forma);
  } catch (error) {
    console.error("Erro ao atualizar forma de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar forma de pagamento" },
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
    await prisma.formaPagamento.update({
      where: { id },
      data: { ativo: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao desativar forma de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao desativar forma de pagamento" },
      { status: 500 }
    );
  }
}
