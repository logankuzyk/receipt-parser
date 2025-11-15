import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { ReceiptTable } from './components/ReceiptTable';
import { processReceipt } from './utils/gemini';
import type { ProcessedFile, ReceiptData } from './types/receipt';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    const newProcessedFiles: ProcessedFile[] = newFiles.map((file) => ({
      file,
      status: 'queued',
      id: `${Date.now()}-${Math.random()}`,
    }));

    setFiles((prev) => [...prev, ...newProcessedFiles]);
  };

  useEffect(() => {
    const processFiles = async () => {
      // Check if any file is already being processed
      const isProcessing = files.some((f) => f.status === 'processing');
      if (isProcessing) {
        return; // Wait for current processing to complete
      }

      const queuedFile = files.find((f) => f.status === 'queued');
      if (!queuedFile) {
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
        
        // Update status to processed and add receipt data
        setFiles((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id
              ? { ...f, status: 'processed', receiptData }
              : f
          )
        );

        setReceipts((prev) => [...prev, receiptData]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Update status to error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id
              ? { ...f, status: 'error', error: errorMessage }
              : f
          )
        );
      }
    };

    processFiles();
  }, [files, apiKey]);

  return (
    <div className="app">
      <h1>Receipt Parser</h1>
      <div className="api-key-section">
        <label htmlFor="api-key">Google Gemini API Key:</label>
        <input
          id="api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="api-key-input"
        />
      </div>
      <FileUpload onFilesSelected={handleFilesSelected} />
      <FileList files={files} />
      <ReceiptTable receipts={receipts} />
    </div>
  );
}

export default App;
