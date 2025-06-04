
import React from 'react';
import { Upload } from 'lucide-react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { cn } from '@/lib/utils';

interface DragDropZoneProps {
  onFileDrop: (files: FileList) => void;
  acceptedTypes?: string[];
  children: React.ReactNode;
  className?: string;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  onFileDrop,
  acceptedTypes = ['.csv', '.xlsx', '.xls'],
  children,
  className,
}) => {
  const { isDragging, dragHandlers } = useDragAndDrop({
    onFileDrop,
    acceptedTypes,
  });

  return (
    <div
      className={cn(
        'relative',
        className
      )}
      {...dragHandlers}
    >
      {children}
      
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-50">
          <div className="text-center text-white">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p className="text-lg font-semibold">Solte os arquivos aqui</p>
            <p className="text-sm text-slate-300">
              Tipos aceitos: {acceptedTypes.join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
