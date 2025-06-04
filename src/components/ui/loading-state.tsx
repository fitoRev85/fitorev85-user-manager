
import React from 'react';
import { Loader2, Brain, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  type?: 'default' | 'data' | 'analysis' | 'forecast';
  message?: string;
  className?: string;
}

const LoadingIcon = ({ type }: { type: LoadingStateProps['type'] }) => {
  const iconClass = "w-8 h-8 animate-spin";
  
  switch (type) {
    case 'data':
      return <BarChart3 className={iconClass} />;
    case 'analysis':
      return <TrendingUp className={iconClass} />;
    case 'forecast':
      return <Brain className={iconClass} />;
    default:
      return <Loader2 className={iconClass} />;
  }
};

const getLoadingMessage = (type: LoadingStateProps['type']) => {
  switch (type) {
    case 'data':
      return 'Carregando dados...';
    case 'analysis':
      return 'Processando análise...';
    case 'forecast':
      return 'Gerando previsões...';
    default:
      return 'Carregando...';
  }
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'default',
  message,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      "animate-fade-in",
      className
    )}>
      <div className="relative mb-4">
        <div className="absolute inset-0 animate-ping">
          <LoadingIcon type={type} />
        </div>
        <LoadingIcon type={type} />
      </div>
      <p className="text-slate-400 animate-pulse">
        {message || getLoadingMessage(type)}
      </p>
      <div className="flex space-x-1 mt-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};
