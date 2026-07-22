"use client";

import { useEffect, useState } from "react";
import { formatCPF, formatTelefone } from "@/lib/format";
import "./vendas.css";

type Venda = {
  id: number;
  numero: number;
  comprador: string | null;
  cpfComprador: string | null;
  telefoneComprador: string | null;
  cidadeComprador: string | null;
  dataVenda: string | null;
  vendedor: {
    nome: string;
  } | null;
};

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [processandoCancelamento, setProcessandoCancelamento] = useState<number | string | null>(null);

  type VendaBloco = {
    start: number;
    end: number;
    comprador: string | null;
    cpfComprador: string | null;
    telefoneComprador: string | null;
    cidadeComprador: string | null;
    vendedorNome: string | null;
    dataVenda: string | null;
  };

  function agruparVendasEmBlocos(vendas: Venda[]) {
    const vendasOrdenadas = [...vendas].sort((a, b) => a.numero - b.numero);
    const blocos: VendaBloco[] = [];

    for (const venda of vendasOrdenadas) {
      const ultimoBloco = blocos[blocos.length - 1];
      const mesmoVendedor = ultimoBloco?.vendedorNome === venda.vendedor?.nome;
      const mesmaVenda =
        ultimoBloco &&
        ultimoBloco.comprador === venda.comprador &&
        ultimoBloco.cpfComprador === venda.cpfComprador &&
        ultimoBloco.telefoneComprador === venda.telefoneComprador &&
        ultimoBloco.cidadeComprador === venda.cidadeComprador &&
        ultimoBloco.dataVenda === venda.dataVenda &&
        mesmoVendedor &&
        venda.numero === ultimoBloco.end + 1;

      if (mesmaVenda) {
        ultimoBloco.end = venda.numero;
      } else {
        blocos.push({
          start: venda.numero,
          end: venda.numero,
          comprador: venda.comprador,
          cpfComprador: venda.cpfComprador,
          telefoneComprador: venda.telefoneComprador,
          cidadeComprador: venda.cidadeComprador,
          vendedorNome: venda.vendedor?.nome ?? null,
          dataVenda: venda.dataVenda,
        });
      }
    }

    return blocos;
  }

  async function carregarVendas() {
    setCarregando(true);
    setErro(null);
    try {
      const response = await fetch("/api/compradores?vendido=true", {
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Erro ao carregar vendas.");
      }

      const data = (await response.json()) as Venda[];
      setVendas(data);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  async function cancelarVendaBloco(bloco: VendaBloco) {
    const rangeLabel = bloco.start === bloco.end ? `${bloco.start}` : `${bloco.start}-${bloco.end}`;
    const confirmado = window.confirm(
      `Cancelar a venda do intervalo ${rangeLabel}? Essa ação vai deixar esses números disponíveis novamente.`
    );
    if (!confirmado) {
      return;
    }

    setMensagem(null);
    setErro(null);
    setProcessandoCancelamento(rangeLabel);

    try {
      const response = await fetch(`/api/compradores?numeros=${rangeLabel}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao cancelar a venda.");
      }

      setMensagem(
        bloco.start === bloco.end
          ? `Venda do número ${bloco.start} cancelada com sucesso.`
          : `Venda do intervalo ${rangeLabel} cancelada com sucesso.`
      );
      await carregarVendas();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setProcessandoCancelamento(null);
    }
  }

  useEffect(() => {
    carregarVendas();
  }, []);

  return (
    <main className="vendas-page">
      <section className="vendas-header" aria-labelledby="titulo-vendas">
        <span className="vendas-kicker">Registros de venda</span>
        <h2 id="titulo-vendas">Números vendidos</h2>
        <p>Veja as vendas registradas e cancele uma venda quando um número foi registrado incorretamente.</p>
      </section>

      <section className="vendas-status" aria-live="polite">
        {mensagem ? <div className="vendas-mensagem vendas-mensagem-sucesso">{mensagem}</div> : null}
        {erro ? <div className="vendas-mensagem vendas-mensagem-erro">{erro}</div> : null}
      </section>

      <section className="vendas-lista-container">
        {carregando ? (
          <div className="vendas-loading">Carregando registros de vendas...</div>
        ) : vendas.length === 0 ? (
          <div className="vendas-empty">Nenhuma venda registrada no momento.</div>
        ) : (
          <div className="vendas-table-wrapper">
            <table className="vendas-table">
              <thead>
                <tr>
                  <th>Venda</th>
                  <th>Comprador</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Cidade</th>
                  <th>Vendedor</th>
                  <th>Data da venda</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {agruparVendasEmBlocos(vendas).map((bloco) => {
                  const rangeLabel = bloco.start === bloco.end ? `${bloco.start}` : `${bloco.start}-${bloco.end}`;

                  return (
                    <tr key={`${bloco.start}-${bloco.end}-${bloco.comprador}-${bloco.dataVenda}`}>
                      <td>{rangeLabel}</td>
                      <td>{bloco.comprador ?? "-"}</td>
                      <td>{bloco.cpfComprador ? formatCPF(bloco.cpfComprador) : "-"}</td>
                      <td>{bloco.telefoneComprador ? formatTelefone(bloco.telefoneComprador) : "-"}</td>
                      <td>{bloco.cidadeComprador ?? "-"}</td>
                      <td>{bloco.vendedorNome ?? "-"}</td>
                      <td>
                        {bloco.dataVenda
                          ? new Date(bloco.dataVenda).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="vendas-cancel-button"
                          disabled={processandoCancelamento !== null}
                          onClick={() => cancelarVendaBloco(bloco)}
                        >
                          {processandoCancelamento === rangeLabel ? "Cancelando..." : "Cancelar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
