import { PrismaClient, CategoriaServico, StatusComanda } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── Admin ───
  const senhaHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@barbearia.com" },
    update: {},
    create: {
      nome: "Admin",
      email: "admin@barbearia.com",
      senha: senhaHash,
    },
  });
  console.log("✅ Admin criado:", admin.email);

  // ─── Categorias de Bebida ───
  const catBebidas = [
    { nome: "Cervejas", descricao: "Cervejas artesanais e comerciais" },
    { nome: "Refrigerantes", descricao: "Refrigerantes e águas" },
    { nome: "Destilados", descricao: "Whisky, vodka e outros" },
    { nome: "Não alcoólicas", descricao: "Sucos e energéticos" },
  ];
  for (const cat of catBebidas) {
    await prisma.categoriaBebida.upsert({
      where: { nome: cat.nome },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categorias de bebida criadas");

  // ─── Categorias de Produto ───
  const catProdutos = [
    { nome: "Finalização", descricao: "Pomadas, ceras e sprays" },
    { nome: "Cabelo", descricao: "Shampoos, condicionadores e óleos" },
    { nome: "Barba", descricao: "Óleos, bálsamos e shampoos para barba" },
    { nome: "Acessórios", descricao: "Pentes, escovas e máquinas" },
  ];
  for (const cat of catProdutos) {
    await prisma.categoriaProduto.upsert({
      where: { nome: cat.nome },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categorias de produto criadas");

  // ─── Serviços ───
  const servicos = [
    { nome: "Corte Masculino", descricao: "Corte tesoura e máquina", categoria: CategoriaServico.CORTE, preco: 50.0, duracaoMin: 40 },
    { nome: "Corte Degradê", descricao: "Corte degradê com tesoura e máquina", categoria: CategoriaServico.CORTE, preco: 65.0, duracaoMin: 50 },
    { nome: "Barba Completa", descricao: "Barba com navalha e toalha quente", categoria: CategoriaServico.BARBA, preco: 35.0, duracaoMin: 30 },
    { nome: "Corte + Barba", descricao: "Combo corte + barba", categoria: CategoriaServico.COMBO, preco: 75.0, duracaoMin: 60 },
    { nome: "Hidratação Capilar", descricao: "Hidratação profunda", categoria: CategoriaServico.HIDRATACAO, preco: 45.0, duracaoMin: 30 },
    { nome: "Sobrancelha", descricao: "Design de sobrancelha", categoria: CategoriaServico.SOBRANCELHA, preco: 20.0, duracaoMin: 15 },
    { nome: "Corte Infantil", descricao: "Corte para crianças até 12 anos", categoria: CategoriaServico.CORTE, preco: 40.0, duracaoMin: 30 },
    { nome: "Combo Plus", descricao: "Corte + Barba + Hidratação", categoria: CategoriaServico.COMBO, preco: 110.0, duracaoMin: 80 },
  ];
  for (const servico of servicos) {
    await prisma.servico.create({ data: servico });
  }
  console.log(`✅ ${servicos.length} serviços criados`);

  // ─── Bebidas ───
  const cervejaCat = await prisma.categoriaBebida.findUniqueOrThrow({ where: { nome: "Cervejas" } });
  const refriCat = await prisma.categoriaBebida.findUniqueOrThrow({ where: { nome: "Refrigerantes" } });
  const destiladosCat = await prisma.categoriaBebida.findUniqueOrThrow({ where: { nome: "Destilados" } });
  const naoAlcCat = await prisma.categoriaBebida.findUniqueOrThrow({ where: { nome: "Não alcoólicas" } });

  const bebidas = [
    { nome: "Cerveja Heineken Lata", preco: 8.0, categoriaId: cervejaCat.id, possuiAlcool: true, volumeMl: 350 },
    { nome: "Cerveja Corona Long Neck", preco: 12.0, categoriaId: cervejaCat.id, possuiAlcool: true, volumeMl: 355 },
    { nome: "Cerveja Brahma Chopp 300ml", preco: 6.0, categoriaId: cervejaCat.id, possuiAlcool: true, volumeMl: 300 },
    { nome: "Whisky Red Label Dose", preco: 25.0, categoriaId: destiladosCat.id, possuiAlcool: true, volumeMl: 50 },
    { nome: "Vodka Smirnoff Dose", preco: 15.0, categoriaId: destiladosCat.id, possuiAlcool: true, volumeMl: 50 },
    { nome: "Coca-Cola Lata", preco: 5.0, categoriaId: refriCat.id, possuiAlcool: false, volumeMl: 350 },
    { nome: "Guaraná Lata", preco: 5.0, categoriaId: refriCat.id, possuiAlcool: false, volumeMl: 350 },
    { nome: "Água Mineral 500ml", preco: 3.0, categoriaId: refriCat.id, possuiAlcool: false, volumeMl: 500 },
    { nome: "Suco Natural Laranja", preco: 8.0, categoriaId: naoAlcCat.id, possuiAlcool: false, volumeMl: 300 },
    { nome: "Energético Red Bull", preco: 12.0, categoriaId: naoAlcCat.id, possuiAlcool: false, volumeMl: 250 },
    { nome: "Cerveja Artesanal IPA", preco: 18.0, categoriaId: cervejaCat.id, possuiAlcool: true, volumeMl: 473 },
    { nome: "Água Tônica", preco: 6.0, categoriaId: refriCat.id, possuiAlcool: false, volumeMl: 350 },
  ];
  for (const bebida of bebidas) {
    await prisma.bebida.create({ data: bebida });
  }
  console.log(`✅ ${bebidas.length} bebidas criadas`);

  // ─── Produtos ───
  const finalizacaoCat = await prisma.categoriaProduto.findUniqueOrThrow({ where: { nome: "Finalização" } });
  const cabeloCat = await prisma.categoriaProduto.findUniqueOrThrow({ where: { nome: "Cabelo" } });
  const barbaCat = await prisma.categoriaProduto.findUniqueOrThrow({ where: { nome: "Barba" } });
  const acessoriosCat = await prisma.categoriaProduto.findUniqueOrThrow({ where: { nome: "Acessórios" } });

  const produtos = [
    { nome: "Pomada Modeladora Sailor", descricao: "Pomada modeladora efeito seco", preco: 45.0, categoriaId: finalizacaoCat.id, quantidade: 20 },
    { nome: "Cera Invisível Line Up", descricao: "Cera com fixação leve e brilho natural", preco: 55.0, categoriaId: finalizacaoCat.id, quantidade: 15 },
    { nome: "Spray Fixador", descricao: "Spray de fixação forte", preco: 35.0, categoriaId: finalizacaoCat.id, quantidade: 25 },
    { nome: "Shampoo Antiqueda", descricao: "Shampoo fortalecedor 300ml", preco: 40.0, categoriaId: cabeloCat.id, quantidade: 10 },
    { nome: "Condicionador Nutritivo", descricao: "Condicionador hidratante 300ml", preco: 42.0, categoriaId: cabeloCat.id, quantidade: 10 },
    { nome: "Óleo Capilar", descricao: "Óleo para barba e cabelo 50ml", preco: 38.0, categoriaId: cabeloCat.id, quantidade: 12 },
    { nome: "Óleo para Barba", descricao: "Óleo hidratante para barba 30ml", preco: 35.0, categoriaId: barbaCat.id, quantidade: 15 },
    { nome: "Bálsamo para Barba", descricao: "Bálsamo hidratante 50g", preco: 40.0, categoriaId: barbaCat.id, quantidade: 10 },
    { nome: "Shampoo para Barba", descricao: "Shampoo específico para barba 200ml", preco: 32.0, categoriaId: barbaCat.id, quantidade: 8 },
    { nome: "Pente Profissional", descricao: "Pente de madeira", preco: 15.0, categoriaId: acessoriosCat.id, quantidade: 30 },
    { nome: "Escova Modeladora", descricao: "Escova redonda para modelagem", preco: 25.0, categoriaId: acessoriosCat.id, quantidade: 20 },
    { nome: "Kit Navalha", descricao: "Kit com 5 navalhas", preco: 28.0, categoriaId: acessoriosCat.id, quantidade: 50 },
  ];
  for (const produto of produtos) {
    await prisma.produto.create({ data: produto });
  }
  console.log(`✅ ${produtos.length} produtos criados`);

  // ─── Formas de Pagamento ───
  const formasPagamento = [
    { nome: "PIX", descricao: "Pagamento instantâneo", permiteParcelamento: false, maximoParcelas: 1 },
    { nome: "Cartão de Crédito", descricao: "Parcelamos em até 12x", permiteParcelamento: true, maximoParcelas: 12 },
    { nome: "Dinheiro", descricao: "Pagamento em espécie", permiteParcelamento: false, maximoParcelas: 1 },
    { nome: "Cartão de Débito", descricao: "Pagamento na hora", permiteParcelamento: false, maximoParcelas: 1 },
  ];
  for (const fp of formasPagamento) {
    await prisma.formaPagamento.create({ data: fp });
  }
  console.log(`✅ ${formasPagamento.length} formas de pagamento criadas`);

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log(`   Admin: admin@barbearia.com / admin123`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
