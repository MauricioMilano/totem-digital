import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categorias = await prisma.categoriaServico.findMany({
    orderBy: [{ sortOrder: "asc" }, { nome: "asc" }],
  });

  return NextResponse.json(
    categorias.map((c) => ({ id: c.id, nome: c.nome }))
  );
}
