"use client";

import { FormEvent, useState } from "react";

import "./dados.css";

const vendedores = ["Ian", "Leandro", "Gabriel", "Heloisa"];

export default function Formulario() {
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cadastrarComprador(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setErro("");
    setEnviando(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const dadosComprador = {
      comprador: String(formData.get("comprador")),
      cpfComprador: String(formData.get("cpfComprador")),
      telefoneComprador: String(formData.get("telefoneComprador")),
      cidadeComprador: String(formData.get("cidadeComprador")),
      numerosRifa: String(formData.get("numerosRifa")),
      vendedorNome: String(formData.get("vendedorNome")),
    };

    try {
      const response = await fetch("/api/compradores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosComprador),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Nao foi possivel cadastrar o comprador.");
      }

      const totalNumeros = Array.isArray(data.rifas) ? data.rifas.length : 1;

      setMensagem(
        totalNumeros === 1
          ? "Comprador cadastrado com sucesso."
          : `${totalNumeros} numeros cadastrados com sucesso.`
      );
      form.reset();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel cadastrar o comprador."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="dados-page">
      <section className="dados-form-container" aria-labelledby="titulo-cadastro">
        <div className="dados-form-header">
          <span className="dados-form-kicker">Cadastro de comprador</span>
          <h2 id="titulo-cadastro">Dados do comprador da rifa</h2>
          <p>Preencha as informacoes para registrar a venda dos numeros escolhidos.</p>
        </div>

        <form className="dados-form" onSubmit={cadastrarComprador}>
          <div className="dados-field dados-field-full">
            <label htmlFor="comprador">Nome completo</label>
            <input
              type="text"
              id="comprador"
              name="comprador"
              placeholder="Digite o nome do comprador"
              autoComplete="name"
              required
            />
          </div>

          <div className="dados-field">
            <label htmlFor="cpfComprador">CPF</label>
            <input
              type="text"
              id="cpfComprador"
              name="cpfComprador"
              placeholder="000.000.000-00"
              autoComplete="off"
              inputMode="numeric"
              required
            />
          </div>

          <div className="dados-field">
            <label htmlFor="telefoneComprador">Telefone</label>
            <input
              type="tel"
              id="telefoneComprador"
              name="telefoneComprador"
              placeholder="(00) 00000-0000"
              autoComplete="tel"
              required
            />
          </div>

          <div className="dados-field">
            <label htmlFor="cidadeComprador">Cidade</label>
            <input
              type="text"
              id="cidadeComprador"
              name="cidadeComprador"
              placeholder="Cidade do comprador"
              autoComplete="address-level2"
              required
            />
          </div>

          <div className="dados-field">
            <label htmlFor="vendedorNome">Vendedor</label>
            <select id="vendedorNome" name="vendedorNome" defaultValue="" required>
              <option value="" disabled>
                Selecione o vendedor
              </option>
              {vendedores.map((vendedor) => (
                <option key={vendedor} value={vendedor}>
                  {vendedor}
                </option>
              ))}
            </select>
          </div>

          <div className="dados-field">
            <label htmlFor="numerosRifa">Numeros da rifa</label>
            <input
              type="text"
              id="numerosRifa"
              name="numerosRifa"
              placeholder="Ex: 125, 126, 130-135"
              inputMode="text"
              required
            />
          </div>

          <button className="dados-submit" type="submit" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar comprador"}
          </button>

          <div className="dados-feedback" aria-live="polite">
            {mensagem && <p className="dados-feedback-success">{mensagem}</p>}
            {erro && <p className="dados-feedback-error">{erro}</p>}
          </div>
        </form>
      </section>
    </main>
  );
}
