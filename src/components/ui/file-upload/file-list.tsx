import { cn } from '@/lib/utils';
import { UploadedFileItem } from './file-item';

interface UploadedFileListProps {
  uploadedFiles: File[];
  removeFile: (index: number) => void;
}

export function FileList({
  uploadedFiles,
  removeFile,
}: UploadedFileListProps) {
  if (uploadedFiles.length === 0) {
    return null;
  }

  return (
    <div className={cn('mt-4 space-y-3 px-6 pb-5')}>
      {uploadedFiles.map((file, index) => (
        <UploadedFileItem
          file={file}
          key={file.name + index}
          onRemove={() => removeFile(index)}
        />
      ))}
    </div>
  );
}
