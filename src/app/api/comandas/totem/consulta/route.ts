import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COMANDA_INCLUDE = {
  itens: {
    include: {
      servico: true,
      bebida: true,
      produto: true,
    },
  },
  cliente: true,
} as const;

// Resolve an OPEN comanda from a single input that can be:
// - a receipt code (guests), e.g. "K7X2QP"
// - a CPF (11 digits)
// - a phone number (digits only)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("code") ?? "").trim();

  if (!raw) {
    return NextResponse.json({ error: "Informe CPF, telefone ou código" }, { status: 400 });
  }

  try {
    return await handleConsulta(raw);
  } catch (error) {
    console.error("Erro ao consultar comanda:", error);
    return NextResponse.json({ error: "Erro interno ao consultar comanda" }, { status: 500 });
  }
}

async function handleConsulta(raw: string): Promise<NextResponse> {
  const digits = raw.replace(/\D/g, "");
  const codeUpper = raw.toUpperCase();

  // 1) Receipt code (guests) — short alphanumeric token
  if (raw.length <= 8 && /[A-Z]/i.test(raw)) {
    const comanda = await prisma.comanda.findFirst({
      where: { codigoRecibo: codeUpper, status: "ABERTA" },
      include: COMANDA_INCLUDE,
    });
    if (comanda) return NextResponse.json({ tipo: "recibo", comanda });
  }

  // 2) CPF (11 digits) → client → open comanda
  if (digits.length === 11) {
    const cliente = await prisma.cliente.findUnique({ where: { cpf: digits } });
    if (cliente) {
      const comanda = await prisma.comanda.findFirst({
        where: { clienteId: cliente.id, status: "ABERTA" },
        include: COMANDA_INCLUDE,
        orderBy: { createdAt: "desc" },
      });
      if (comanda) return NextResponse.json({ tipo: "cpf", comanda });
    }
  }

  // 3) Phone (digits, >= 8) → client → open comanda
  if (digits.length >= 8 && digits.length <= 13) {
    const cliente = await prisma.cliente.findFirst({ where: { telefone: digits } });
    if (cliente) {
      const comanda = await prisma.comanda.findFirst({
        where: { clienteId: cliente.id, status: "ABERTA" },
        include: COMANDA_INCLUDE,
        orderBy: { createdAt: "desc" },
      });
      if (comanda) return NextResponse.json({ tipo: "telefone", comanda });
    }
  }

  return NextResponse.json(
    { error: "Nenhuma comanda aberta encontrada para este CPF, telefone ou código." },
    { status: 404 }
  );
}
