
import React, { useState } from 'react';
import { DraggableWidget } from './DraggableWidget';

export interface Widget {
  id: string;
  title: string;
  component: React.ReactNode;
  order: number;
}

interface WidgetGridProps {
  widgets: Widget[];
  onReorder?: (widgets: Widget[]) => void;
  onRemoveWidget?: (widgetId: string) => void;
  className?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets: initialWidgets,
  onReorder,
  onRemoveWidget,
  className = "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6",
}) => {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    const draggedWidgetId = e.dataTransfer.getData('text/plain');
    const draggedIndex = widgets.findIndex(w => w.id === draggedWidgetId);

    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    const newWidgets = [...widgets];
    const [draggedWidget] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(dropIndex, 0, draggedWidget);

    // Update order
    const reorderedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      order: index,
    }));

    setWidgets(reorderedWidgets);
    onReorder?.(reorderedWidgets);
  };

  const handleRemoveWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);
    onRemoveWidget?.(widgetId);
  };

  return (
    <div className={className}>
      {widgets
        .sort((a, b) => a.order - b.order)
        .map((widget, index) => (
          <div
            key={widget.id}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`transition-all duration-200 ${
              dragOverIndex === index ? 'ring-2 ring-blue-400 rounded-lg' : ''
            }`}
          >
            <DraggableWidget
              id={widget.id}
              title={widget.title}
              onRemove={handleRemoveWidget}
            >
              {widget.component}
            </DraggableWidget>
          </div>
        ))}
    </div>
  );
};
