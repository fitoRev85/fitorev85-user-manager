
import { useState, useCallback } from 'react';

interface DragDropConfig {
  onFileDrop: (files: FileList) => void;
  acceptedTypes?: string[];
}

export const useDragAndDrop = ({ onFileDrop, acceptedTypes = [] }: DragDropConfig) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const isAcceptedFileType = useCallback((file: File): boolean => {
    if (acceptedTypes.length === 0) return true;
    
    return acceptedTypes.some(type => {
      // Verificar por extensão de arquivo
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      } 
      // Verificar por tipo MIME
      else if (type.includes('/')) {
        return file.type === type;
      }
      // Verificação genérica (exemplo: 'csv' vai considerar '.csv' e 'text/csv')
      else {
        return (
          file.name.toLowerCase().endsWith(`.${type.toLowerCase()}`) || 
          file.type.toLowerCase().includes(type.toLowerCase())
        );
      }
    });
  }, [acceptedTypes]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      // Filtrar arquivos por tipos aceitos
      if (acceptedTypes.length > 0) {
        const validFiles = Array.from(files).filter(file => isAcceptedFileType(file));
        
        if (validFiles.length > 0) {
          const fileList = new DataTransfer();
          validFiles.forEach(file => fileList.items.add(file));
          onFileDrop(fileList.files);
        }
      } else {
        onFileDrop(files);
      }
    }
  }, [onFileDrop, acceptedTypes, isAcceptedFileType]);

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
};
