import type { ReceiptData } from '../types/receipt';

/**
 * Sanitizes a merchant name to only include alphabetical characters
 */
function sanitizeMerchantName(str: string): string {
  return str
    .replace(/[^a-zA-Z\s]/g, '') // Remove all non-alphabetical characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .trim() || 'Unknown'; // Fallback to 'Unknown' if empty
}

/**
 * Formats the filename according to the pattern:
 * {YYYY}-{MM}-{DD}_{Merchant Name}_{Amount}_{Card last 4 digits}.{original file extension}
 */
export function formatReceiptFilename(
  receiptData: ReceiptData,
  originalFilename: string
): string {
  // Extract date parts (receiptData.date is in YYYY-MM-DD format)
  const dateParts = receiptData.date.split('-');
  const year = dateParts[0] || new Date().getFullYear().toString();
  const month = dateParts[1] || String(new Date().getMonth() + 1).padStart(2, '0');
  const day = dateParts[2] || String(new Date().getDate()).padStart(2, '0');

  // Sanitize merchant name (only alphabetical characters)
  const merchant = sanitizeMerchantName(receiptData.merchant || 'Unknown');

  // Format amount in dollars (rounded to nearest dollar) with dollar sign prefix
  const amountInDollars = Math.abs(Math.round(receiptData.total));
  const amount = `$${amountInDollars}`;

  // Get original file extension
  const lastDotIndex = originalFilename.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? originalFilename.substring(lastDotIndex) : '';

  // Build filename parts
  const parts = [
    `${year}-${month}-${day}`,
    merchant,
    amount,
  ];

  // Add card last 4 digits if available
  if (receiptData.cardLast4) {
    parts.push(receiptData.cardLast4);
  }

  return `${parts.join('_')}${extension}`;
}

/**
 * Downloads a file with a custom filename
 */
export function downloadFile(file: File, filename: string): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

