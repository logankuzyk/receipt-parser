export type FileStatus = 'queued' | 'processing' | 'processed' | 'error';

export interface FileWithStatus {
  file: File;
  status: FileStatus;
  id: string;
}

export interface ReceiptData {
  date: string;
  merchant: string;
  description: string; // 5 words or less
  total: number; // positive for purchases, negative for returns
  cardLast4?: string; // Last 4 digits of the card number used for the transaction
}

export interface ProcessedFile extends FileWithStatus {
  receiptData?: ReceiptData;
  error?: string;
}

