"use client";

import { useEffect, useState } from "react";
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
  const [processandoCancelamento, setProcessandoCancelamento] = useState<number | null>(null);

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

  async function cancelarVenda(numero: number) {
    const confirmado = window.confirm(
      `Cancelar a venda do número ${numero}? Essa ação vai deixar o número disponível novamente.`
    );
    if (!confirmado) {
      return;
    }

    setMensagem(null);
    setErro(null);
    setProcessandoCancelamento(numero);

    try {
      const response = await fetch(`/api/compradores?numero=${numero}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao cancelar a venda.");
      }

      setMensagem(`Venda do número ${numero} cancelada com sucesso.`);
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
                  <th>Número</th>
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
                {vendas.map((venda) => (
                  <tr key={venda.id}>
                    <td>{venda.numero}</td>
                    <td>{venda.comprador ?? "-"}</td>
                    <td>{venda.cpfComprador ?? "-"}</td>
                    <td>{venda.telefoneComprador ?? "-"}</td>
                    <td>{venda.cidadeComprador ?? "-"}</td>
                    <td>{venda.vendedor?.nome ?? "-"}</td>
                    <td>
                      {venda.dataVenda
                        ? new Date(venda.dataVenda).toLocaleString("pt-BR", {
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
                        disabled={processandoCancelamento === venda.numero}
                        onClick={() => cancelarVenda(venda.numero)}
                      >
                        {processandoCancelamento === venda.numero ? "Cancelando..." : "Cancelar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
