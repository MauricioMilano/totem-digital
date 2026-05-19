import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoriaId = searchParams.get("categoriaId");

  const bebidas = await prisma.bebida.findMany({
    where: {
      ativo: true,
      ...(categoriaId ? { categoriaId } : {}),
    },
    include: { categoria: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(bebidas);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descricao, preco, categoriaId, possuiAlcool, volumeMl } = body;

    if (!nome || !preco || !categoriaId) {
      return NextResponse.json(
        { error: "Nome, preço e categoria são obrigatórios" },
        { status: 400 }
      );
    }

    const bebida = await prisma.bebida.create({
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoriaId,
        possuiAlcool: possuiAlcool || false,
        volumeMl: volumeMl ? parseInt(volumeMl) : null,
      },
      include: { categoria: true },
    });

    return NextResponse.json(bebida, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar bebida:", error);
    return NextResponse.json(
      { error: "Erro ao criar bebida" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const bebida = await prisma.bebida.update({
      where: { id },
      data: {
        ...data,
        preco: data.preco ? parseFloat(data.preco) : undefined,
        volumeMl: data.volumeMl ? parseInt(data.volumeMl) : undefined,
      },
      include: { categoria: true },
    });

    return NextResponse.json(bebida);
  } catch (error) {
    console.error("Erro ao atualizar bebida:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar bebida" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.bebida.update({
      where: { id },
      data: { ativo: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao desativar bebida:", error);
    return NextResponse.json(
      { error: "Erro ao desativar bebida" },
      { status: 500 }
    );
  }
}
