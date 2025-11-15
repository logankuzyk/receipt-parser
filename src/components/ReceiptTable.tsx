import { useState } from 'react';
import { copyTSV, downloadCSV } from '../utils/export';
import type { ReceiptData } from '../types/receipt';

interface ReceiptTableProps {
  receipts: ReceiptData[];
  onUpdate: (index: number, receipt: ReceiptData) => void;
  onDelete: (index: number) => void;
}

export function ReceiptTable({ receipts, onUpdate, onDelete }: ReceiptTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<ReceiptData | null>(null);

  const formatCurrency = (amount: number): string => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues({ ...receipts[index] });
  };

  const handleSave = (index: number) => {
    if (editValues) {
      onUpdate(index, editValues);
      setEditingIndex(null);
      setEditValues(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditValues(null);
  };

  const handleDeleteClick = (index: number) => {
    if (pendingDeleteIndex === index) {
      // Second click - confirm deletion
      onDelete(index);
      setPendingDeleteIndex(null);
    } else {
      // First click - mark for deletion
      setPendingDeleteIndex(index);
      // Reset after 3 seconds if not clicked again
      setTimeout(() => {
        setPendingDeleteIndex((prev) => (prev === index ? null : prev));
      }, 3000);
    }
  };

  const handleFieldChange = (field: keyof ReceiptData, value: string | number) => {
    if (editValues && editingIndex !== null) {
      const updated = { ...editValues, [field]: value };
      setEditValues(updated);
      // Auto-save on change
      onUpdate(editingIndex, updated);
    }
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt, index) => (
            <tr key={index}>
              {editingIndex === index && editValues ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editValues.date}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                      className="edit-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editValues.merchant}
                      onChange={(e) => handleFieldChange('merchant', e.target.value)}
                      className="edit-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editValues.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      className="edit-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editValues.cardLast4 || ''}
                      onChange={(e) => handleFieldChange('cardLast4', e.target.value)}
                      className="edit-input"
                      placeholder="-"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={editValues.total}
                      onChange={(e) => handleFieldChange('total', parseFloat(e.target.value) || 0)}
                      className="edit-input"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleSave(index)}
                      className="save-button"
                      title="Save changes"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancel}
                      className="cancel-button"
                      title="Cancel editing"
                    >
                      ✕
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{receipt.date}</td>
                  <td>{receipt.merchant}</td>
                  <td>{receipt.description}</td>
                  <td>{receipt.cardLast4 || '-'}</td>
                  <td className={receipt.total >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(receipt.total)}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(index)}
                      className="edit-button"
                      title="Edit row"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteClick(index)}
                      className={`delete-button ${pendingDeleteIndex === index ? 'pending' : ''}`}
                      title={pendingDeleteIndex === index ? 'Click again to confirm deletion' : 'Delete row'}
                    >
                      {pendingDeleteIndex === index ? '🗑️ ✓' : '🗑️'}
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

