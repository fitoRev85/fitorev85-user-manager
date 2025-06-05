import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { Bell, AlertTriangle, Info, CheckCircle, Calendar, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface EventsAlertsProps {
  propertyId: string;
}

const EventsAlerts = ({ propertyId }: EventsAlertsProps) => {
  const { 
    alerts, 
    marcarAlertaComoVisualizado, 
    obterEventosPropriedade,
    calcularImpactoData
  } = useEvents();
  
  const [showRead, setShowRead] = useState(false);

  const eventos = obterEventosPropriedade(propertyId);
  
  // Filtrar alertas da propriedade atual
  const alertsPropriedade = alerts.filter(alert => {
    const evento = eventos.find(e => e.id === alert.eventoId);
    return evento !== undefined;
  });

  const alertsNaoLidos = alertsPropriedade.filter(alert => !alert.visualizado);
  const alertsLidos = alertsPropriedade.filter(alert => alert.visualizado);

  const alertsExibidos = showRead ? alertsPropriedade : alertsNaoLidos;

  // Gerar alertas automáticos baseados em eventos próximos
  const gerarAlertasAutomaticos = () => {
    const hoje = new Date();
    const alertasAutomaticos = [];

    eventos.forEach(evento => {
      const dataEvento = parseISO(evento.dataInicio);
      const diasParaEvento = Math.ceil((dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      // Alerta para eventos nos próximos 7 dias
      if (diasParaEvento > 0 && diasParaEvento <= 7) {
        alertasAutomaticos.push({
          id: `auto_${evento.id}_7d`,
          tipo: 'evento_proximo',
          titulo: `Evento "${evento.nome}" em ${diasParaEvento} dias`,
          descricao: `Revise estratégias de pricing para maximizar o impacto do evento`,
          prioridade: evento.impacto === 'alto' ? 'alta' : 'media',
          evento: evento,
          dias: diasParaEvento
        });
      }

      // Alerta para eventos nos próximos 30 dias
      if (diasParaEvento > 7 && diasParaEvento <= 30) {
        alertasAutomaticos.push({
          id: `auto_${evento.id}_30d`,
          tipo: 'oportunidade_pricing',
          titulo: `Oportunidade: ${evento.nome}`,
          descricao: `Evento em ${diasParaEvento} dias. Considere ajustar preços antecipadamente`,
          prioridade: 'media',
          evento: evento,
          dias: diasParaEvento
        });
      }
    });

    return alertasAutomaticos;
  };

  const alertasAutomaticos = gerarAlertasAutomaticos();

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
      {/* Header */}
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
              {alertsNaoLidos.length} não lidos
            </span>
            <Badge variant="outline" className="text-red-400 border-red-400">
              {alertsNaoLidos.length}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRead(!showRead)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {showRead ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showRead ? 'Ocultar Lidos' : 'Mostrar Lidos'}
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Alta Prioridade</p>
                <p className="text-lg font-bold text-white">
                  {alertsPropriedade.filter(a => a.prioridade === 'alta').length}
                </p>
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
                <p className="text-lg font-bold text-white">{alertsNaoLidos.length}</p>
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
                <p className="text-lg font-bold text-white">{alertsLidos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              {alertsExibidos.map((alert) => {
                const evento = eventos.find(e => e.id === alert.eventoId);
                
                return (
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
                          {evento && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(parseISO(evento.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                              <span>Impacto: {evento.impacto}</span>
                            </div>
                          )}
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsAlerts;
