import type { ProcessedFile } from '../types/receipt';

interface FileListProps {
  files: ProcessedFile[];
}

export function FileList({ files }: FileListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return '#666';
      case 'processing':
        return '#2196F3';
      case 'processed':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return '#666';
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="file-list">
      <h3>Uploaded Files</h3>
      <ul>
        {files.map((file) => (
          <li key={file.id} className="file-item">
            <span className="file-name">{file.file.name}</span>
            <span
              className="status-badge"
              style={{ backgroundColor: getStatusColor(file.status) }}
            >
              {file.status}
            </span>
            {file.error && (
              <span className="error-message">Error: {file.error}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

