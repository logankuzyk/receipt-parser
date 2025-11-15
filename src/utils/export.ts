import type { ReceiptData } from '../types/receipt';

export function copyTSV(data: ReceiptData[]): void {
  if (data.length === 0) {
    return;
  }

  const headers = ['Date', 'Merchant', 'Description', 'Total'];
  const rows = data.map((receipt) => [
    receipt.date,
    receipt.merchant,
    receipt.description,
    receipt.total.toString(),
  ]);

  const tsv = [headers, ...rows]
    .map((row) => row.join('\t'))
    .join('\n');

  navigator.clipboard.writeText(tsv).catch((err) => {
    console.error('Failed to copy TSV:', err);
  });
}

export function downloadCSV(data: ReceiptData[]): void {
  if (data.length === 0) {
    return;
  }

  const headers = ['Date', 'Merchant', 'Description', 'Total'];
  const rows = data.map((receipt) => [
    receipt.date,
    receipt.merchant,
    receipt.description,
    receipt.total.toString(),
  ]);

  // Escape commas and quotes in CSV
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `receipts-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

