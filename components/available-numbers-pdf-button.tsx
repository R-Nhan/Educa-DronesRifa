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
      const logoPath = "/imagens/Logo.png";

      // Cria um pdf temporário só para obter as dimensões A4 em mm
      const tempPdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pWidth = tempPdf.internal.pageSize.getWidth();
      const pHeight = tempPdf.internal.pageSize.getHeight();

      const marginLeft = 8;
      const marginRight = 8;
      const marginTop = 10;
      const topAreaHeight = 14;
      const gap = 1.2;
      const minCellWidth = 6;
      const minCellHeight = 6;

      const computeLayout = (pageW: number, pageH: number) => {
        const availableWidth = pageW - marginLeft - marginRight;
        const availableHeight = pageH - marginTop - topAreaHeight - 6;
        const maxColumns = Math.max(1, Math.floor((availableWidth + gap) / (minCellWidth + gap)));
        const maxRows = Math.max(1, Math.floor((availableHeight + gap) / (minCellHeight + gap)));
        const itemsPerPage = maxColumns * maxRows;
        return { pageW, pageH, availableWidth, availableHeight, maxColumns, maxRows, itemsPerPage };
      };

      const portrait = computeLayout(pWidth, pHeight);
      const landscape = computeLayout(pHeight, pWidth);

      const useLandscape = landscape.itemsPerPage > portrait.itemsPerPage;
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: useLandscape ? "landscape" : "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const layout = useLandscape ? landscape : portrait;

      const drawPage = (items: number[], pageIndex: number) => {
        if (pageIndex > 0) pdf.addPage();

        pdf.setFontSize(11);
        pdf.text("Números disponíveis", marginLeft, marginTop);
        pdf.setFontSize(7.5);
        pdf.text(`Total: ${numeros.length}`, marginLeft, marginTop + 6);
        pdf.text("Educa Drones", pageWidth - marginRight, marginTop + 6, { align: "right" });

        try {
          pdf.addImage(logoPath, "PNG", pageWidth - marginRight - 34, 3, 32, 13);
        } catch {
          // ignora erro caso a imagem não seja carregada
        }

        let columns = layout.maxColumns;
        let rows = Math.ceil(items.length / columns);
        while (rows > layout.maxRows && columns > 1) {
          columns -= 1;
          rows = Math.ceil(items.length / columns);
        }

        const cellWidth = (layout.availableWidth - (columns - 1) * gap) / columns;
        const cellHeight = (layout.availableHeight - (rows - 1) * gap) / rows;
        const startY = marginTop + topAreaHeight;

        items.forEach((numero, index) => {
          const columnIndex = index % columns;
          const rowIndex = Math.floor(index / columns);
          const x = marginLeft + columnIndex * (cellWidth + gap);
          const y = startY + rowIndex * (cellHeight + gap);

          pdf.setFontSize(5.5);
          pdf.text(String(numero), x + cellWidth / 2, y + cellHeight / 2 + 1.8, { align: "center" });
        });
      };

      // Calcula quantos por página com o layout escolhido e gera o mínimo de páginas
      const itemsPerPage = layout.maxColumns * layout.maxRows;
      for (let pageIndex = 0; pageIndex < numeros.length; pageIndex += itemsPerPage) {
        const pageItems = numeros.slice(pageIndex, pageIndex + itemsPerPage);
        drawPage(pageItems, Math.floor(pageIndex / itemsPerPage));
      }
      >
        {loading ? "Gerando..." : "Gerar PDF"}
      </button>
      {message ? <p style={{ margin: 0, fontSize: "0.9rem", color: "#4b5563" }}>{message}</p> : null}
    </div>
  );
}
