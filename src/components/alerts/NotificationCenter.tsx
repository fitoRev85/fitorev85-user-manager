
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, TrendingUp, TrendingDown, X, Check, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/hooks/useAlerts';

interface NotificationCenterProps {
  alerts: Alert[];
  stats: {
    activeCount: number;
    unreadCount: number;
    highPriorityCount: number;
  };
  onMarkAsRead: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onClearAll: () => void;
}

const NotificationCenter = ({ 
  alerts, 
  stats, 
  onMarkAsRead, 
  onDismissAlert, 
  onClearAll 
}: NotificationCenterProps) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'property'>('timestamp');

  const getSeverityIcon = (severity: string, type: string) => {
    if (type === 'predictive') {
      return severity === 'high' ? 
        <TrendingDown className="w-4 h-4 text-red-400" /> : 
        <TrendingUp className="w-4 h-4 text-yellow-400" />;
    }
    
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'low': return <Bell className="w-4 h-4 text-green-400" />;
      default: return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500/30 bg-red-500/10';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'low': return 'border-green-500/30 bg-green-500/10';
      default: return 'border-slate-500/30 bg-slate-500/10';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'predictive': return 'bg-purple-500/20 text-purple-400';
      case 'threshold': return 'bg-blue-500/20 text-blue-400';
      case 'system': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const filteredAlerts = alerts
    .filter(alert => {
      if (filter === 'unread' && alert.isRead) return false;
      if (filter === 'high' && alert.severity !== 'high') return false;
      if (searchTerm && !alert.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !alert.propertyName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.severity as keyof typeof priorityOrder] - priorityOrder[a.severity as keyof typeof priorityOrder];
        case 'property':
          return a.propertyName.localeCompare(b.propertyName);
        case 'timestamp':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Central de Notificações
            {stats.unreadCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400">
                {stats.unreadCount} não lidas
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onClearAll}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={alerts.length === 0}
            >
              Limpar Todas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700/30 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.activeCount}</div>
            <div className="text-xs text-slate-400">Alertas Ativos</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.unreadCount}</div>
            <div className="text-xs text-slate-400">Não Lidas</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">{stats.highPriorityCount}</div>
            <div className="text-xs text-slate-400">Alta Prioridade</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar alertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white"
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="unread">Não lidas</SelectItem>
              <SelectItem value="high">Alta prioridade</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="timestamp">Data</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="property">Propriedade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Alertas */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400">
                  {alerts.length === 0 ? 'Nenhum alerta ativo' : 'Nenhum alerta encontrado com os filtros aplicados'}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-all ${getSeverityColor(alert.severity)} ${
                    !alert.isRead ? 'ring-1 ring-blue-500/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(alert.severity, alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{alert.title}</h4>
                          <Badge className={getTypeColor(alert.type)}>
                            {alert.type === 'predictive' ? 'Preditivo' : 
                             alert.type === 'threshold' ? 'Threshold' : 'Sistema'}
                          </Badge>
                          {!alert.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm mb-1">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>{alert.propertyName}</span>
                          <span>{new Date(alert.timestamp).toLocaleString('pt-BR')}</span>
                          {alert.prediction && (
                            <span>Confiança: {(alert.prediction.confidence * 100).toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!alert.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onMarkAsRead(alert.id)}
                          className="text-blue-400 hover:text-blue-300 h-6 w-6 p-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDismissAlert(alert.id)}
                        className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {alert.prediction && (
                    <div className="mt-3 p-2 bg-slate-800/50 rounded border border-slate-600/50">
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Atual:</span>
                          <div className="text-white font-medium">{alert.prediction.currentValue.toFixed(1)}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Previsto:</span>
                          <div className="text-white font-medium">{alert.prediction.predictedValue.toFixed(1)}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Em {alert.prediction.daysAhead} dias</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
