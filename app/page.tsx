import { connection } from "next/server";

import { prisma } from "@/lib/prisma";
import { AvailableNumbersPdfButton } from "@/components/available-numbers-pdf-button";

import "./home.css";

const vendedoresPadrao = ["Ian", "Leandro", "Gabriel", "Heloisa"];

function getCountId(count: unknown) {
  if (typeof count !== "object" || count === null || !("id" in count)) {
    return 0;
  }

  const id = count.id;
  return typeof id === "number" ? id : 0;
}

async function getTopVendedores() {
  try {
    const [vendedores, vendas] = await prisma.$transaction([
      prisma.vendedor.findMany({
        select: {
          id: true,
          nome: true,
        },
      }),
      prisma.rifaNumero.groupBy({
        by: ["vendedorId"],
        where: {
          vendido: true,
          vendedorId: {
            not: null,
          },
        },
        orderBy: {
          vendedorId: "asc",
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const vendasPorVendedor = new Map(
      vendas.map((venda) => [venda.vendedorId, getCountId(venda._count)])
    );
    const nomes = [
      ...new Set([
        ...vendedoresPadrao,
        ...vendedores.map((vendedor) => vendedor.nome),
      ]),
    ];

    return nomes
      .map((nome) => {
        const vendedor = vendedores.find((item) => item.nome === nome);

        return {
          nome,
          vendas: vendedor ? vendasPorVendedor.get(vendedor.id) ?? 0 : 0,
        };
      })
      .sort((a, b) => b.vendas - a.vendas || a.nome.localeCompare(b.nome))
      .slice(0, 3);
  } catch (error) {
    console.error("Erro ao carregar ranking dos vendedores:", error);
    return vendedoresPadrao.map((nome) => ({ nome, vendas: 0 }));
  }
}

export default async function Home() {
  await connection();

  const [primeiro, segundo, terceiro] = await getTopVendedores();

  return (
    <main className="ranking-page">
      <section className="ranking-card" aria-labelledby="titulo-ranking">
        <h2 id="titulo-ranking">Ranking dos Vendedores</h2>

        <div className="primeiro-lugar">
          <span className="trofeu" aria-hidden="true">
            🏆
          </span>
          <span className="posicao">1º lugar</span>
          <strong>{primeiro?.nome ?? "Sem vendedor"}</strong>
          <p>{primeiro?.vendas ?? 0} rifas vendidas</p>
        </div>

        <div className="outros-lugares">
          {[segundo, terceiro].map((vendedor, index) => (
            <div className="lugar" key={vendedor?.nome ?? index}>
              <span className="posicao">{index + 2}º lugar</span>
              <strong>{vendedor?.nome ?? "Sem vendedor"}</strong>
              <p>{vendedor?.vendas ?? 0} rifas vendidas</p>
            </div>
          ))}
        </div>
      </section>

      <section className="export-card" aria-labelledby="titulo-export">
        <h2 id="titulo-export">Exportar números disponíveis</h2>
        <p>Gere um PDF com todos os números que ainda não foram vendidos.</p>
        <AvailableNumbersPdfButton />
      </section>
    </main>
  );
}
