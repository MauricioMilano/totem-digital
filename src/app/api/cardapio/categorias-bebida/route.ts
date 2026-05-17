import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categorias = await prisma.categoriaBebida.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(categorias);
}
