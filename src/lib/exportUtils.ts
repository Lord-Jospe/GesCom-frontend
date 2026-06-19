import * as XLSX from 'xlsx';

export const exportarExcel = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName = 'Datos',
) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
