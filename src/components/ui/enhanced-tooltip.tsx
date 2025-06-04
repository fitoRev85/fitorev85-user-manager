
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Info, HelpCircle, TrendingUp, AlertCircle } from 'lucide-react';

interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  type?: 'info' | 'help' | 'warning' | 'trend';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  showIcon?: boolean;
}

const TooltipIcon = ({ type }: { type: EnhancedTooltipProps['type'] }) => {
  const iconClass = "w-4 h-4 ml-1 opacity-60 hover:opacity-100 transition-opacity";
  
  switch (type) {
    case 'help':
      return <HelpCircle className={iconClass} />;
    case 'warning':
      return <AlertCircle className={iconClass} />;
    case 'trend':
      return <TrendingUp className={iconClass} />;
    default:
      return <Info className={iconClass} />;
  }
};

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  children,
  content,
  type = 'info',
  side = 'top',
  className,
  showIcon = false
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center cursor-help">
          {children}
          {showIcon && <TooltipIcon type={type} />}
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        className={cn(
          "max-w-xs text-sm animate-fade-in",
          type === 'warning' && "bg-yellow-900 border-yellow-700",
          type === 'trend' && "bg-green-900 border-green-700",
          className
        )}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
};
