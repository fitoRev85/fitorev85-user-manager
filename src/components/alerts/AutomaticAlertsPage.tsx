
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Bell, 
  Info, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAutomaticAlerts, AutomaticAlert } from '@/hooks/useAutomaticAlerts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const AutomaticAlertsPage = () => {
  const navigate = useNavigate();
  const { alerts, estatisticas } = useAutomaticAlerts();

  const getAlertIcon = (type: AutomaticAlert['type']) => {
    switch (type) {
      case 'occupancy':
        return <Users className="w-5 h-5" />;
      case 'adr':
        return <DollarSign className="w-5 h-5" />;
      case 'revenue':
        return <Target className="w-5 h-5" />;
      case 'reservations':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityIcon = (priority: AutomaticAlert['priority']) => {
    switch (priority) {
      case 'alta':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'media':
        return <Bell className="w-4 h-4 text-yellow-400" />;
      case 'baixa':
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: AutomaticAlert['priority']) => {
    switch (priority) {
      case 'alta':
        return 'border-red-500 bg-red-500/10';
      case 'media':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'baixa':
        return 'border-blue-500 bg-blue-500/10';
    }
  };

  const getPriorityBadge = (priority: AutomaticAlert['priority']) => {
    switch (priority) {
      case 'alta':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Alta</Badge>;
      case 'media':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Média</Badge>;
      case 'baixa':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Baixa</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
              <Bell className="w-10 h-10 text-orange-400" />
              Sistema de Alertas
            </h1>
            <p className="text-xl text-slate-300">
              Monitoramento automático de performance e indicadores críticos
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Bell className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total de Alertas</p>
                  <p className="text-white text-2xl font-bold">{estatisticas.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Prioridade Alta</p>
                  <p className="text-white text-2xl font-bold">{estatisticas.alta}</p>
                  <p className="text-red-400 text-xs">Requer ação imediata</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Bell className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Prioridade Média</p>
                  <p className="text-white text-2xl font-bold">{estatisticas.media}</p>
                  <p className="text-yellow-400 text-xs">Monitorar de perto</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Info className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Prioridade Baixa</p>
                  <p className="text-white text-2xl font-bold">{estatisticas.baixa}</p>
                  <p className="text-blue-400 text-xs">Informativo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Alertas */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400 mb-2">
                  Nenhum alerta ativo
                </h3>
                <p className="text-slate-500">
                  Todas as métricas estão dentro dos parâmetros normais
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 border rounded-lg ${getPriorityColor(alert.priority)} hover:bg-slate-600/20 transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{alert.title}</h4>
                            {getPriorityIcon(alert.priority)}
                          </div>
                          <p className="text-sm text-slate-400 mb-2">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="font-medium text-slate-300">{alert.propertyName}</span>
                            <span>{format(alert.timestamp, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                            <span>
                              Atual: {alert.type === 'revenue' ? 'R$ ' : ''}{alert.value.toFixed(alert.type === 'revenue' ? 0 : 1)}{alert.type === 'occupancy' ? '%' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(alert.priority)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutomaticAlertsPage;
