import { copyTSV, downloadCSV } from '../utils/export';
import type { ReceiptData } from '../types/receipt';

interface ReceiptTableProps {
  receipts: ReceiptData[];
}

export function ReceiptTable({ receipts }: ReceiptTableProps) {
  const formatCurrency = (amount: number): string => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  };

  if (receipts.length === 0) {
    return null;
  }

  return (
    <div className="receipt-table-container">
      <div className="table-actions">
        <button onClick={() => copyTSV(receipts)} className="action-button">
          Copy TSV
        </button>
        <button onClick={() => downloadCSV(receipts)} className="action-button">
          Download CSV
        </button>
      </div>
      <table className="receipt-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Merchant</th>
            <th>Description</th>
            <th>Card Last 4</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt, index) => (
            <tr key={index}>
              <td>{receipt.date}</td>
              <td>{receipt.merchant}</td>
              <td>{receipt.description}</td>
              <td>{receipt.cardLast4 || '-'}</td>
              <td className={receipt.total >= 0 ? 'positive' : 'negative'}>
                {formatCurrency(receipt.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

