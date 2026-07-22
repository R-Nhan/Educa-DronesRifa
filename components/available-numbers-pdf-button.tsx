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

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginLeft = 10;
      const marginRight = 10;
      const marginTop = 18;
      const topAreaHeight = 16;
      const gap = 2;
      const logoPath = "/imagens/Logo.png";

      const availableWidth = pageWidth - marginLeft - marginRight;
      const availableHeight = pageHeight - marginTop - topAreaHeight - 8;
      const minCellWidth = 8;
      const minCellHeight = 7;
      const maxColumns = Math.max(1, Math.floor((availableWidth + gap) / (minCellWidth + gap)));
      const maxRows = Math.max(1, Math.floor((availableHeight + gap) / (minCellHeight + gap)));

      const drawPage = (items: number[]) => {
        pdf.setFontSize(12);
        pdf.text("Números disponíveis", marginLeft, marginTop);
        pdf.setFontSize(8);
        pdf.text(`Total: ${numeros.length}`, marginLeft, marginTop + 7);
        pdf.text("Educa Drones", pageWidth - marginRight, marginTop + 7, { align: "right" });

        try {
          pdf.addImage(logoPath, "PNG", pageWidth - marginRight - 36, 3, 34, 14);
        } catch {
          // ignora erro caso a imagem não seja carregada
        }

        let columns = maxColumns;
        let rows = Math.ceil(items.length / columns);
        while (rows > maxRows && columns > 1) {
          columns -= 1;
          rows = Math.ceil(items.length / columns);
        }

        const cellWidth = (availableWidth - (columns - 1) * gap) / columns;
        const cellHeight = (availableHeight - (rows - 1) * gap) / rows;
        const startY = marginTop + topAreaHeight;

        items.forEach((numero, index) => {
          const columnIndex = index % columns;
          const rowIndex = Math.floor(index / columns);
          const x = marginLeft + columnIndex * (cellWidth + gap);
          const y = startY + rowIndex * (cellHeight + gap);

          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.2);
          pdf.rect(x, y, cellWidth, cellHeight, "S");

          pdf.setFontSize(6);
          pdf.text(String(numero), x + cellWidth / 2, y + cellHeight / 2 + 1.6, { align: "center" });
        });
      };

      drawPage(numeros);

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
