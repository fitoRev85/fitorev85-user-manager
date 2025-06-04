
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
  className?: string;
  collapsible?: boolean;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id,
  title,
  children,
  onRemove,
  className,
  collapsible = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card
      className={cn(
        'bg-slate-800/50 backdrop-blur-xl border-slate-700/50 transition-all duration-200',
        isDragging && 'opacity-50 rotate-2 scale-105',
        className
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-400" />
          <CardTitle className="text-white text-sm font-medium">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              {isCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(id)}
              className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};
