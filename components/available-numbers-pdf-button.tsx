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
      const marginLeft = 28;
      const marginTop = 24;
      const titleHeight = 18;
      const gap = 4;
      const logoPath = "/imagens/Logo.png";

      const availableWidth = pageWidth - marginLeft * 2;
      const availableHeight = pageHeight - marginTop * 2 - titleHeight - 20;
      const minCellWidth = 20;
      const minCellHeight = 12;
      const maxColumns = Math.max(1, Math.floor((availableWidth + gap) / (minCellWidth + gap)));
      const maxRows = Math.max(1, Math.floor((availableHeight + gap) / (minCellHeight + gap)));
      const maxItemsPerPage = maxColumns * maxRows;

      const totalPages = Math.ceil(numeros.length / maxItemsPerPage);

      const drawPage = (items: number[], pageNumber: number) => {
        if (pageNumber > 1) {
          pdf.addPage();
        }

        pdf.setFontSize(12);
        pdf.text("Números disponíveis", marginLeft, titleHeight);
        pdf.setFontSize(10);
        pdf.text(`Total: ${numeros.length}`, marginLeft, titleHeight + 14);
        pdf.text("Educa Drones", marginLeft, 26);
        pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 92, 26);

        try {
          pdf.addImage(logoPath, "PNG", pageWidth - 118, 14, 58, 20);
        } catch {
          // ignora erro caso a imagem não seja carregada
        }

        let columns = Math.min(maxColumns, Math.max(1, Math.ceil(items.length / maxRows)));
        let rows = Math.ceil(items.length / columns);

        while (rows > maxRows && columns > 1) {
          columns -= 1;
          rows = Math.ceil(items.length / columns);
        }

        const cellWidth = Math.max(minCellWidth, (availableWidth - (columns - 1) * gap) / columns);
        const cellHeight = Math.max(minCellHeight, (availableHeight - (rows - 1) * gap) / rows);
        const startY = marginTop + 34;

        items.forEach((numero, index) => {
          const columnIndex = index % columns;
          const rowIndex = Math.floor(index / columns);
          const x = marginLeft + columnIndex * (cellWidth + gap);
          const y = startY + rowIndex * (cellHeight + gap);

          pdf.setDrawColor(200, 200, 200);
          pdf.setFillColor(255, 255, 255);
          pdf.rect(x, y, cellWidth, cellHeight, "S");

          pdf.setFontSize(7.5);
          pdf.text(String(numero), x + cellWidth / 2, y + cellHeight / 2 + 1.8, { align: "center" });
        });
      };

      for (let pageIndex = 0; pageIndex < numeros.length; pageIndex += maxItemsPerPage) {
        const pageItems = numeros.slice(pageIndex, pageIndex + maxItemsPerPage);
        drawPage(pageItems, Math.floor(pageIndex / maxItemsPerPage) + 1);
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
    <div className="pdf-export-button" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
      <button
        type="button"
        onClick={handleGeneratePdf}
        disabled={loading}
        style={{
          background: loading ? "#f3f4f6" : "#F3E7C5",
          color: loading ? "#6b7280" : "#143A6B",
          borderRadius: "6px",
          padding: "12px 18px",
          textDecoration: "none",
          fontSize: "1rem",
          fontWeight: 700,
          border: "none",
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Gerando..." : "Gerar PDF"}
      </button>
      {message ? <p style={{ margin: 0, fontSize: "0.9rem", color: "#4b5563" }}>{message}</p> : null}
    </div>
  );
}