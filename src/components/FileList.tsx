import type { ProcessedFile } from '../types/receipt';

interface FileListProps {
  files: ProcessedFile[];
}

export function FileList({ files }: FileListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'var(--nord3)';
      case 'processing':
        return 'var(--nord8)';
      case 'processed':
        return 'var(--nord14)';
      case 'error':
        return 'var(--nord11)';
      default:
        return 'var(--nord3)';
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

