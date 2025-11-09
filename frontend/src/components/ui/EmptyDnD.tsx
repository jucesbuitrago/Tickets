import React from 'react';
import { Upload } from 'lucide-react';
import { AdminCard } from './AdminCard';

interface EmptyDnDProps {
  onFileSelect?: (file: File) => void;
  onUploadClick?: () => void;
}

export function EmptyDnD({ onFileSelect, onUploadClick }: EmptyDnDProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files[0]);
    }
  };

  return (
    <AdminCard className="h-96 flex flex-col items-center justify-center text-center">
      <div
        className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={onUploadClick}
      >
        <Upload className="w-12 h-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          ¡Arrastra y suelta los componentes aquí!
        </h3>
        <p className="text-sm text-slate-500">
          O haz clic para seleccionar un archivo
        </p>
      </div>
    </AdminCard>
  );
}