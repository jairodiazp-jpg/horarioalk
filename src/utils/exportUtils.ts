import * as XLSX from 'xlsx';
import { Employee } from '@/data/stores';
import { SHIFT_MAP } from '@/data/shifts';

const MONTHS_ES = ['', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

const DAYS_ES_LONG = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

export function exportToExcel(
  storeName: string,
  department: string,
  employees: Employee[],
  schedule: Record<string, Record<number, string>>,
  year: number,
  month: number
) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const wb = XLSX.utils.book_new();
  const wsData: (string | number)[][] = [];

  // Header rows
  wsData.push([`${MONTHS_ES[month]} ${year}`, '', '', ...days.map(d => {
    const date = new Date(year, month - 1, d);
    return DAYS_ES_LONG[date.getDay()];
  })]);
  wsData.push(['', '', '', ...days.map(d => {
    const date = new Date(year, month - 1, d);
    return `${d}/${month}`;
  })]);
  wsData.push(['CÓDIGO', 'NOMBRE', 'ACTIVIDAD', ...days]);

  // Employee rows
  employees.forEach(emp => {
    const row: (string | number)[] = [emp.codigo, emp.nombre, emp.actividad];
    days.forEach(day => {
      row.push(schedule[emp.id]?.[day] || '');
    });
    wsData.push(row);
  });

  // Shift legend
  wsData.push([]);
  wsData.push(['LEYENDA DE TURNOS']);
  wsData.push(['CÓDIGO', 'INICIO', 'FIN', 'DESCRIPCIÓN']);
  SHIFT_MAP.forEach(shift => {
    wsData.push([shift.code, shift.start || '-', shift.end || '-', shift.label]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, // código
    { wch: 30 }, // nombre
    { wch: 40 }, // actividad
    ...days.map(() => ({ wch: 7 })),
  ];

  XLSX.utils.book_append_sheet(wb, ws, MONTHS_ES[month]);
  XLSX.writeFile(wb, `Horario_${storeName}_${department}_${MONTHS_ES[month]}_${year}.xlsx`);
}

export function printSchedule(storeName: string, department: string, month: number, year: number) {
  const printStyle = `
    <style>
      @page { size: A3 landscape; margin: 10mm; }
      body { font-family: Arial, sans-serif; font-size: 7px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ccc; padding: 2px 3px; text-align: center; }
      th { background: #1a2f55; color: white; font-size: 7px; }
      .shift-A { background: #bbf7d0; color: #14532d; font-weight: bold; }
      .shift-C { background: #fed7aa; color: #7c2d12; font-weight: bold; }
      .shift-I { background: #fef08a; color: #713f12; font-weight: bold; }
      .shift-N { background: #e2e8f0; color: #334155; font-weight: bold; }
      .shift-LIBRE { background: #fecaca; color: #7f1d1d; font-weight: bold; }
      .shift-COMP { background: #fda4af; color: #881337; font-weight: bold; }
      .shift-LIC { background: #c7d2fe; color: #1e1b4b; font-weight: bold; }
      .shift-VC { background: #bae6fd; color: #0c4a6e; font-weight: bold; }
      .col-info { text-align: left; min-width: 40px; }
    </style>
  `;

  const scheduleTable = document.querySelector('.schedule-table');
  if (!scheduleTable) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Horario ${storeName} - ${department} - ${MONTHS_ES[month]} ${year}</title>
      ${printStyle}
    </head>
    <body>
      <h2 style="text-align:center;color:#1a2f55;margin-bottom:4px;font-size:11px;">
        ${storeName} · PROGRAMACIÓN ${department.toUpperCase()} · ${MONTHS_ES[month]} ${year}
      </h2>
      ${scheduleTable.outerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
