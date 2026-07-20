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

      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginLeft = 36;
      const marginTop = 36;
      const titleHeight = 22;
      const gap = 8;

      pdf.setFontSize(12);
      pdf.text("Números disponíveis", marginLeft, titleHeight);
      pdf.setFontSize(10);
      pdf.text(`Total: ${numeros.length}`, marginLeft, titleHeight + 16);

      const availableWidth = pageWidth - marginLeft * 2;
      const availableHeight = pageHeight - marginTop * 2 - titleHeight - 24;
      const minCellWidth = 34;
      const minCellHeight = 20;
      const maxColumns = Math.max(1, Math.floor((availableWidth + gap) / (minCellWidth + gap)));
      const maxRows = Math.max(1, Math.floor((availableHeight + gap) / (minCellHeight + gap)));

      let columns = Math.min(maxColumns, Math.max(4, Math.ceil(Math.sqrt(numeros.length))));
      let rows = Math.ceil(numeros.length / columns);

      while (rows > maxRows && columns > 1) {
        columns -= 1;
        rows = Math.ceil(numeros.length / columns);
      }

      const cellWidth = Math.max(minCellWidth, (availableWidth - (columns - 1) * gap) / columns);
      const cellHeight = Math.max(minCellHeight, (availableHeight - (rows - 1) * gap) / rows);
      const startY = marginTop + 34;

      const drawCell = (index: number, numero: number) => {
        const columnIndex = index % columns;
        const rowIndex = Math.floor(index / columns);
        const x = marginLeft + columnIndex * (cellWidth + gap);
        const y = startY + rowIndex * (cellHeight + gap);

        pdf.setDrawColor(220, 220, 220);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(x, y, cellWidth, cellHeight, "S");

        pdf.setFontSize(9);
        pdf.text(String(numero), x + cellWidth / 2, y + cellHeight / 2 + 3, { align: "center" });
      };

      numeros.forEach((numero, index) => drawCell(index, numero));

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
      <button
        type="button"
        onClick={handleGeneratePdf}
        disabled={loading}
        style={{
          border: "none",
          background: "transparent",
          color: "#4b5563",
          cursor: loading ? "default" : "pointer",
          padding: 0,
          fontSize: "0.95rem",
          textDecoration: "underline",
        }}
      >
        {loading ? "Gerando..." : "Gerar PDF"}
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
