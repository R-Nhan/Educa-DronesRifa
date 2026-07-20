"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

type RifaNumero = {
  numero: number;
};

export function AvailableNumbersPdfButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGeneratePdf() {
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/compradores?disponivel=true");
      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Erro ao buscar números disponíveis.");
      }

      const data = (await response.json()) as RifaNumero[];
      const numeros = data.map((item) => item.numero).sort((a, b) => a - b);

      if (numeros.length === 0) {
        setMessage("Não há números disponíveis no momento.");
        return;
      }

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      pdf.setFontSize(16);
      pdf.text("Números Disponíveis", 40, 48);
      pdf.setFontSize(11);
      pdf.text(`Total: ${numeros.length}`, 40, 68);

      const marginLeft = 40;
      const marginTop = 92;
      const lineHeight = 16;
      const pageHeight = pdf.internal.pageSize.height;
      const maxLinesPerPage = Math.floor((pageHeight - marginTop - 40) / lineHeight);

      let lineIndex = 0;
      let pageIndex = 0;

      const renderLine = (text: string) => {
        const y = marginTop + lineIndex * lineHeight;
        if (y > pageHeight - 40) {
          pdf.addPage();
          pageIndex += 1;
          lineIndex = 0;
        }
        pdf.text(text, marginLeft, marginTop + lineIndex * lineHeight);
        lineIndex += 1;
      };

      renderLine("Número");
      renderLine("----------------");

      for (const numero of numeros) {
        renderLine(String(numero));
      }

      pdf.save("numeros_disponiveis.pdf");
      setMessage(`PDF gerado com ${numeros.length} números disponíveis.`);
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      setMessage(`Erro: ${text}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pdf-export-button">
      <button type="button" onClick={handleGeneratePdf} disabled={loading}>
        {loading ? "Gerando PDF..." : "Gerar PDF de números disponíveis"}
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
