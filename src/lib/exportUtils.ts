import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ─── Excel ─────────────────────────────────────────────────

export const exportarExcel = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName = 'Datos',
) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// ─── PDF ──────────────────────────────────────────────────

export const exportarPDF = (
  titulo: string,
  columnas: { header: string; dataKey: string }[],
  filas: Record<string, any>[],
  filename: string,
  resumen?: { label: string; value: string }[],
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Título
  doc.setFontSize(14);
  doc.text(titulo, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-VE')}`, 14, 21);

  // Tabla
  (doc as any).autoTable({
    startY: 26,
    head: [columnas.map(c => c.header)],
    body: filas.map(f => columnas.map(c => String(f[c.dataKey] ?? ''))),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [93, 135, 255], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 10, right: 10 },
  });

  // Resumen al final
  if (resumen && resumen.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 26;
    let y = finalY + 10;
    doc.setFontSize(9);
    resumen.forEach(({ label, value }) => {
      doc.setTextColor(60);
      doc.text(`${label}:`, 14, y);
      doc.setTextColor(0);
      doc.text(value, 60, y);
      y += 5;
    });
  }

  doc.save(`${filename}.pdf`);
};
