
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Bell, CheckCircle } from 'lucide-react';

interface AlertsStatsProps {
  estatisticas: {
    alertasAlta: number;
    alertasNaoLidos: number;
    alertasLidos: number;
  };
}

export const AlertsStats = ({ estatisticas }: AlertsStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Alta Prioridade</p>
              <p className="text-lg font-bold text-white">{estatisticas.alertasAlta}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Não Visualizados</p>
              <p className="text-lg font-bold text-white">{estatisticas.alertasNaoLidos}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Resolvidos</p>
              <p className="text-lg font-bold text-white">{estatisticas.alertasLidos}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
