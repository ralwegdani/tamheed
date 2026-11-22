// Builds a CSV file in the browser and downloads it. No library needed.
// rows: array of arrays. The first row is the header.

function cell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  // Quote cells that contain commas, quotes or new lines.
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function downloadCSV(fileName, rows) {
  const text = rows.map((row) => row.map(cell).join(',')).join('\n');
  // The BOM (﻿) makes Excel read Arabic text correctly.
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
