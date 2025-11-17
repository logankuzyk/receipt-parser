import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { ReceiptTable } from './components/ReceiptTable';
import { processReceipt } from './utils/gemini';
import { formatReceiptFilename, downloadFile } from './utils/download';
import type { ProcessedFile, ReceiptData } from './types/receipt';
import './App.css';

const STORAGE_KEY = 'receipt-parser-data';

function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [receipts, setReceipts] = useState<ReceiptData[]>(() => {
    // Load receipts from localStorage on initial render
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load receipts from localStorage:', error);
    }
    return [];
  });
  const [startProcessing, setStartProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Save receipts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
    } catch (error) {
      console.error('Failed to save receipts to localStorage:', error);
    }
  }, [receipts]);

  // Auto-dismiss error message after 10 seconds
  useEffect(() => {
    if (errorMessage) {
      const timeoutId = setTimeout(() => {
        setErrorMessage(null);
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [errorMessage]);

  const handleFilesSelected = (newFiles: File[]) => {
    const newProcessedFiles: ProcessedFile[] = newFiles.map((file) => ({
      file,
      status: 'queued',
      id: `${Date.now()}-${Math.random()}`,
    }));

    setFiles((prev) => [...prev, ...newProcessedFiles]);
  };

  useEffect(() => {
    if (!startProcessing) {
      return; // Don't process until button is clicked
    }

    const processFiles = async () => {
      // Check if any file is already being processed
      const isProcessing = files.some((f) => f.status === 'processing');
      if (isProcessing) {
        return; // Wait for current processing to complete
      }

      const queuedFile = files.find((f) => f.status === 'queued');
      if (!queuedFile) {
        setStartProcessing(false); // Reset when all files are processed
        return; // No files to process
      }

      // Update status to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === queuedFile.id ? { ...f, status: 'processing' } : f
        )
      );

      if (!apiKey) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id
              ? { ...f, status: 'error', error: 'API key is required' }
              : f
          )
        );
        return;
      }

      try {
        const receiptData = await processReceipt(queuedFile.file, apiKey);
        
        // Clear any previous error messages on success
        setErrorMessage(null);
        
        // Update status to processed and add receipt data
        setFiles((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id
              ? { ...f, status: 'processed', receiptData }
              : f
          )
        );

        setReceipts((prev) => [...prev, receiptData]);

        // Download the file with formatted filename
        const formattedFilename = formatReceiptFilename(receiptData, queuedFile.file.name);
        downloadFile(queuedFile.file, formattedFilename);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        const displayMessage = `Failed to process ${queuedFile.file.name}: ${errorMsg}`;
        
        // Show prominent error message
        setErrorMessage(displayMessage);
        
        // Update status to error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id
              ? { ...f, status: 'error', error: errorMsg }
              : f
          )
        );
      }
    };

    processFiles();
  }, [files, apiKey, startProcessing]);

  const handleStartProcessing = () => {
    if (!apiKey) {
      alert('Please enter your API key first');
      return;
    }
    if (files.length === 0) {
      alert('Please upload at least one file first');
      return;
    }
    setStartProcessing(true);
  };

  const handleUpdateReceipt = (index: number, updatedReceipt: ReceiptData) => {
    setReceipts((prev) => {
      const updated = [...prev];
      updated[index] = updatedReceipt;
      return updated;
    });
  };

  const handleDeleteReceipt = (index: number) => {
    setReceipts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="app">
      <h1>Receipt Parser</h1>
      {errorMessage && (
        <div className="error-notification">
          <div className="error-notification-content">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="error-dismiss"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="api-key-section">
        <label htmlFor="api-key">Google Gemini API Key:</label>
        <input
          id="api-key"
          value={apiKey}
          type="password"
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="api-key-input"
        />
      </div>
      <div className="button-group">
        <FileUpload onFilesSelected={handleFilesSelected} />
        {files.length > 0 && (
          <button onClick={handleStartProcessing} className="process-button">
            Start Processing
          </button>
        )}
      </div>
      <FileList files={files} />
      <ReceiptTable 
        receipts={receipts} 
        onUpdate={handleUpdateReceipt}
        onDelete={handleDeleteReceipt}
      />
    </div>
  );
}

export default App;
