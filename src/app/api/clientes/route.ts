import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const clientes = await prisma.cliente.findMany({
    where: search
      ? {
          OR: [
            { nome: { contains: search, mode: "insensitive" } },
            { cpf: { contains: search } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { comandas: true } },
    },
    orderBy: { nome: "asc" },
    take: 50,
  });

  return NextResponse.json(clientes);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, cpf, telefone, email } = body;

    if (!nome || !cpf) {
      return NextResponse.json(
        { error: "Nome e CPF são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se CPF já existe
    const existente = await prisma.cliente.findUnique({ where: { cpf } });
    if (existente) {
      return NextResponse.json(existente, { status: 200 });
    }

    const cliente = await prisma.cliente.create({
      data: { nome, cpf, telefone, email },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
