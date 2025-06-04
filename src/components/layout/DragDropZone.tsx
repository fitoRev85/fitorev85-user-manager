
import React from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
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
        'relative transition-all duration-200',
        isDragging && 'ring-2 ring-blue-500/50',
        className
      )}
      {...dragHandlers}
    >
      {children}
      
      {isDragging && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center text-white bg-slate-800/80 p-6 rounded-lg border border-slate-600/50">
            <div className="flex items-center justify-center gap-2 mb-3">
              <FileSpreadsheet className="w-8 h-8 text-blue-400" />
              <Upload className="w-6 h-6 text-blue-300" />
            </div>
            <p className="text-lg font-semibold mb-2">Solte os arquivos aqui</p>
            <p className="text-sm text-slate-300">
              Tipos aceitos: {acceptedTypes.join(', ')}
            </p>
            <div className="mt-3 text-xs text-slate-400">
              Sistema inteligente de importação com preview e validação
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
