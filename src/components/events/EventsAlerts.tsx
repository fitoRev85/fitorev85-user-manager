
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { useEventAlerts } from '@/hooks/useEventAlerts';
import { AlertsHeader } from './AlertsHeader';
import { AlertsStats } from './AlertsStats';
import { Bell, AlertTriangle, Info, Calendar, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface EventsAlertsProps {
  propertyId: string;
}

const EventsAlerts = ({ propertyId }: EventsAlertsProps) => {
  const { marcarAlertaComoVisualizado } = useEvents();
  const { 
    alertsPropriedade, 
    alertsNaoLidos, 
    alertsLidos, 
    alertasAutomaticos, 
    estatisticas 
  } = useEventAlerts(propertyId);
  
  const [showRead, setShowRead] = useState(false);

  const alertsExibidos = showRead ? alertsPropriedade : alertsNaoLidos;

  const getPriorityIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'media':
        return <Bell className="w-5 h-5 text-yellow-400" />;
      case 'baixa':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'border-red-500 bg-red-500/10';
      case 'media':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'baixa':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-slate-500 bg-slate-500/10';
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    marcarAlertaComoVisualizado(alertId);
  };

  return (
    <div className="space-y-6">
      <AlertsHeader 
        alertsNaoLidos={alertsNaoLidos.length}
        showRead={showRead}
        onToggleRead={() => setShowRead(!showRead)}
      />

      <AlertsStats estatisticas={estatisticas} />

      {/* Alertas Automáticos */}
      {alertasAutomaticos.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Alertas Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertasAutomaticos.map((alerta) => (
              <div 
                key={alerta.id}
                className={`p-4 border rounded-lg ${getPriorityColor(alerta.prioridade)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(alerta.prioridade)}
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{alerta.titulo}</h4>
                      <p className="text-sm text-slate-400 mt-1">{alerta.descricao}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>Em {alerta.dias} dias</span>
                        <span>Impacto: +{alerta.evento.impactoOcupacao}% ocupação</span>
                        <span>+{alerta.evento.impactoADR}% ADR</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${
                    alerta.prioridade === 'alta' ? 'bg-red-500' :
                    alerta.prioridade === 'media' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}>
                    {alerta.prioridade}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Lista de Alertas */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">
            {showRead ? 'Todos os Alertas' : 'Alertas Não Lidos'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertsExibidos.length === 0 && alertasAutomaticos.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">
                {showRead ? 'Nenhum alerta disponível' : 'Nenhum alerta não lido'}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Alertas aparecerão automaticamente baseados nos seus eventos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertsExibidos.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 border rounded-lg ${getPriorityColor(alert.prioridade)} ${
                    alert.visualizado ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getPriorityIcon(alert.prioridade)}
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{alert.titulo}</h4>
                        <p className="text-sm text-slate-400 mt-1">{alert.descricao}</p>
                        <div className="text-xs text-slate-500 mt-1">
                          {format(parseISO(alert.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${
                        alert.prioridade === 'alta' ? 'bg-red-500' :
                        alert.prioridade === 'media' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {alert.prioridade}
                      </Badge>
                      {!alert.visualizado && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                        >
                          Marcar como lido
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsAlerts;
