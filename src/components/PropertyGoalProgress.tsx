
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp } from 'lucide-react';
import { useReservationData } from '@/hooks/useReservationData';

interface PropertyGoalProgressProps {
  propertyId: string;
  propertyName: string;
  metaMensalReceita: number;
  onUpdateMeta: (newMeta: number) => void;
}

export const PropertyGoalProgress = ({ 
  propertyId, 
  propertyName, 
  metaMensalReceita, 
  onUpdateMeta 
}: PropertyGoalProgressProps) => {
  const { data: reservations } = useReservationData(propertyId);
  
  // Calcular receita do mês atual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const receitaMensal = reservations
    .filter(reservation => {
      const checkInDate = new Date(reservation.data_checkin);
      return checkInDate.getMonth() === currentMonth && 
             checkInDate.getFullYear() === currentYear;
    })
    .reduce((total, reservation) => total + (reservation.valor_total || 0), 0);

  const progresso = metaMensalReceita > 0 ? (receitaMensal / metaMensalReceita) * 100 : 0;
  
  const getStatusColor = () => {
    if (progresso >= 100) return 'text-green-400';
    if (progresso >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = () => {
    if (progresso >= 100) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Meta Atingida</Badge>;
    if (progresso >= 80) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Próximo à Meta</Badge>;
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Abaixo da Meta</Badge>;
  };

  const getProgressColor = () => {
    if (progresso >= 100) return 'bg-green-500';
    if (progresso >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const [isEditing, setIsEditing] = React.useState(false);
  const [tempMeta, setTempMeta] = React.useState(metaMensalReceita.toString());

  const handleSaveMeta = () => {
    const newMeta = parseFloat(tempMeta) || 0;
    onUpdateMeta(newMeta);
    setIsEditing(false);
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Target className={`w-5 h-5 ${getStatusColor()}`} />
            Meta Mensal - {propertyName}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Receita Atual:</span>
            <span className="text-white font-medium">
              R$ {receitaMensal.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-slate-400">Meta Mensal:</span>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tempMeta}
                  onChange={(e) => setTempMeta(e.target.value)}
                  className="w-24 px-2 py-1 text-xs bg-slate-700 text-white rounded border border-slate-600"
                  placeholder="0"
                />
                <button
                  onClick={handleSaveMeta}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setTempMeta(metaMensalReceita.toString());
                  }}
                  className="text-xs bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <span 
                className="text-slate-300 cursor-pointer hover:text-white"
                onClick={() => setIsEditing(true)}
              >
                R$ {metaMensalReceita.toLocaleString('pt-BR')} ✏️
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={Math.min(progresso, 100)} 
            className="h-3"
          />
          <div className="flex justify-between items-center text-xs">
            <span className={`font-medium ${getStatusColor()}`}>
              {progresso.toFixed(1)}% da meta
            </span>
            <div className="flex items-center gap-1 text-slate-400">
              <TrendingUp className="w-3 h-3" />
              {progresso >= 100 ? 'Meta superada!' : `Faltam R$ ${(metaMensalReceita - receitaMensal).toLocaleString('pt-BR')}`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
