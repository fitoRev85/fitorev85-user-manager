
import { useState, useCallback } from 'react';

interface DragDropConfig {
  onFileDrop: (files: FileList) => void;
  acceptedTypes?: string[];
}

export const useDragAndDrop = ({ onFileDrop, acceptedTypes = [] }: DragDropConfig) => {
  const [isDragging, setIsDragging] = useState(false);

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
      // Filter files by accepted types if specified
      if (acceptedTypes.length > 0) {
        const validFiles = Array.from(files).filter(file =>
          acceptedTypes.some(type => file.type.includes(type) || file.name.endsWith(type))
        );
        if (validFiles.length > 0) {
          const fileList = new DataTransfer();
          validFiles.forEach(file => fileList.items.add(file));
          onFileDrop(fileList.files);
        }
      } else {
        onFileDrop(files);
      }
    }
  }, [onFileDrop, acceptedTypes]);

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
