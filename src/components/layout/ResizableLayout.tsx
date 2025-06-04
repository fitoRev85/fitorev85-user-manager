
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface ResizableLayoutProps {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  defaultSizes?: number[];
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  leftPanel,
  rightPanel,
  children,
  direction = 'horizontal',
  defaultSizes = [25, 50, 25],
}) => {
  if (leftPanel && rightPanel) {
    return (
      <ResizablePanelGroup direction={direction} className="h-full">
        <ResizablePanel defaultSize={defaultSizes[0]} minSize={20}>
          <div className="h-full p-4 bg-slate-800/30 rounded-lg">
            {leftPanel}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultSizes[1]} minSize={30}>
          <div className="h-full p-4">
            {children}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultSizes[2]} minSize={20}>
          <div className="h-full p-4 bg-slate-800/30 rounded-lg">
            {rightPanel}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }

  if (leftPanel) {
    return (
      <ResizablePanelGroup direction={direction} className="h-full">
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="h-full p-4 bg-slate-800/30 rounded-lg">
            {leftPanel}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="h-full p-4">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }

  return <div className="h-full">{children}</div>;
};
