
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';

interface AlertsHeaderProps {
  alertsNaoLidos: number;
  showRead: boolean;
  onToggleRead: () => void;
}

export const AlertsHeader = ({ alertsNaoLidos, showRead, onToggleRead }: AlertsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-white">Alertas de Eventos</h2>
        <p className="text-slate-400">
          Monitore eventos que podem impactar sua propriedade
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            {alertsNaoLidos} não lidos
          </span>
          <Badge variant="outline" className="text-red-400 border-red-400">
            {alertsNaoLidos}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleRead}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          {showRead ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showRead ? 'Ocultar Lidos' : 'Mostrar Lidos'}
        </Button>
      </div>
    </div>
  );
};
