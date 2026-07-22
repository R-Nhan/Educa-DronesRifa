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

      const logoPath = "/imagens/Logo.png";

      // Parâmetros base para layout em uma única página
      const marginLeft = 12;
      const marginRight = 12;
      const marginTop = 18;
      const titleHeight = 14;
      const gap = 3;
      const minCellWidth = 12;
      const minCellHeight = 8;

      const count = numeros.length;
      // tenta aproximar um retângulo compacto (mais colunas que linhas)
      let columns = Math.ceil(Math.sqrt(count) * 1.4);
      if (columns < 1) columns = 1;
      let rows = Math.ceil(count / columns);

      // Ajusta até que cada célula seja pelo menos o tamanho mínimo
      const pageWidthEstimate = marginLeft + marginRight + columns * minCellWidth + (columns - 1) * gap;
      const pageHeightEstimate = marginTop + titleHeight + rows * minCellHeight + (rows - 1) * gap + 12;

      while (rows > 1 && (pageHeightEstimate > 200 && columns > 1)) {
        // reduz colunas para tentar diminuir altura
        columns -= 1;
        rows = Math.ceil(count / columns);
      }

      const pageWidth = Math.max(180, pageWidthEstimate);
      const pageHeight = Math.max(120, pageHeightEstimate);

      const pdf = new jsPDF({ unit: "mm", format: [pageWidth, pageHeight] });

      // recalcula dimensões finais com os valores reais
      const availableWidth = pageWidth - marginLeft - marginRight;
      const availableHeight = pageHeight - marginTop - titleHeight - 8;
      columns = Math.max(1, Math.floor((availableWidth + gap) / (minCellWidth + gap)));
      rows = Math.ceil(count / columns);

      const cellWidth = (availableWidth - (columns - 1) * gap) / columns;
      const cellHeight = (availableHeight - (rows - 1) * gap) / rows;

      pdf.setFontSize(12);
      pdf.text("Números disponíveis", marginLeft, marginTop);
      pdf.setFontSize(9);
      pdf.text(`Total: ${numeros.length}`, marginLeft, marginTop + 8);
      pdf.text("Educa Drones", pageWidth - marginRight, marginTop, { align: "right" });

      try {
        pdf.addImage(logoPath, "PNG", pageWidth - marginRight - 50, 6, 46, 16);
      } catch {
        // ignora erro caso a imagem não seja carregada
      }

      const startY = marginTop + titleHeight + 4;

      numeros.forEach((numero, index) => {
        const columnIndex = index % columns;
        const rowIndex = Math.floor(index / columns);
        const x = marginLeft + columnIndex * (cellWidth + gap);
        const y = startY + rowIndex * (cellHeight + gap);

        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(x, y, cellWidth, cellHeight, "S");

        pdf.setFontSize(7);
        pdf.text(String(numero), x + cellWidth / 2, y + cellHeight / 2 + 1.6, { align: "center" });
      });


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
    <div className="pdf-export-button" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
      <button
        type="button"
        onClick={handleGeneratePdf}
        disabled={loading}
        style={{
          border: "1px solid #d1d5db",
          background: loading ? "#f3f4f6" : "#111827",
          color: loading ? "#6b7280" : "#ffffff",
          cursor: loading ? "default" : "pointer",
          padding: "0.7rem 1.1rem",
          fontSize: "0.95rem",
          fontWeight: 600,
          borderRadius: "999px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        {loading ? "Gerando..." : "Gerar PDF"}
      </button>
      {message ? <p style={{ margin: 0, fontSize: "0.9rem", color: "#4b5563" }}>{message}</p> : null}
    </div>
  );
}
