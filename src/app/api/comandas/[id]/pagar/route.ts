import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comanda = await prisma.comanda.findUnique({
      where: { id },
    });

    if (!comanda) {
      return NextResponse.json({ error: "Comanda não encontrada" }, { status: 404 });
    }

     if (comanda.status !== "ABERTA") {
       return NextResponse.json(
         { error: `A comanda está no status ${comanda.status} e não pode ser paga` },
         { status: 400 }
       );
     }

     const body = await request.json().catch(() => ({}));
     const { formaPagamentoId, quantidadeParcelas } = body;

     const updateData: any = {
       status: "PAGA",
       pagaEm: new Date(),
     };

     if (formaPagamentoId) {
       updateData.formaPagamentoId = formaPagamentoId;
     }

     if (quantidadeParcelas !== undefined) {
       updateData.quantidadeParcelas = quantidadeParcelas;
     }

     const paidComanda = await prisma.comanda.update({
       where: { id },
       data: updateData,
       include: {
         cliente: true,
         formaPagamento: true,
         itens: true,
       },
     });

    return NextResponse.json(paidComanda);
    } catch (error) {
      console.error("Erro ao pagar comanda:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhedoci no processamento do pagamento";
      return NextResponse.json(
        { error: `Erro ao pagar comanda: ${errorMessage}` },
        { status: 500 }
      );
    }

}
