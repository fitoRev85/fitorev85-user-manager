
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, History, Search, Filter } from 'lucide-react';
import { Alert } from '@/hooks/useAlerts';

interface AlertHistoryProps {
  alertHistory: Alert[];
}

const AlertHistory = ({ alertHistory }: AlertHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredHistory = alertHistory.filter(alert => {
    // Filtro de busca
    if (searchTerm && !alert.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !alert.propertyName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro de severidade
    if (severityFilter !== 'all' && alert.severity !== severityFilter) {
      return false;
    }

    // Filtro de data
    if (dateFilter !== 'all') {
      const alertDate = new Date(alert.timestamp);
      const now = new Date();
      const diffTime = now.getTime() - alertDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case 'today':
          if (diffDays > 1) return false;
          break;
        case 'week':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
      }
    }

    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
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

  // Estatísticas do histórico
  const stats = {
    total: alertHistory.length,
    high: alertHistory.filter(a => a.severity === 'high').length,
    predictive: alertHistory.filter(a => a.type === 'predictive').length,
    thisWeek: alertHistory.filter(a => {
      const alertDate = new Date(a.timestamp);
      const now = new Date();
      const diffTime = now.getTime() - alertDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" />
          Histórico de Alertas
          <Badge className="bg-slate-700/50 text-slate-300">
            {alertHistory.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Estatísticas do Histórico */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-700/30 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-purple-400">{stats.total}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-red-400">{stats.high}</div>
            <div className="text-xs text-slate-400">Alta Prioridade</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-blue-400">{stats.predictive}</div>
            <div className="text-xs text-slate-400">Preditivos</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-green-400">{stats.thisWeek}</div>
            <div className="text-xs text-slate-400">Esta Semana</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white pl-10"
            />
          </div>
          
          <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
            <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)}>
            <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista do Histórico */}
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400">
                  {alertHistory.length === 0 ? 'Nenhum alerta no histórico' : 'Nenhum alerta encontrado com os filtros aplicados'}
                </p>
              </div>
            ) : (
              filteredHistory.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-slate-700/20 border border-slate-600/30 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white text-sm">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge className={getTypeColor(alert.type)}>
                          {alert.type === 'predictive' ? 'Preditivo' : 
                           alert.type === 'threshold' ? 'Threshold' : 'Sistema'}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs mb-1">{alert.message}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{alert.propertyName}</span>
                        <span>{new Date(alert.timestamp).toLocaleString('pt-BR')}</span>
                        {alert.value && alert.threshold && (
                          <span>
                            Valor: {alert.value.toFixed(1)} / Limite: {alert.threshold}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AlertHistory;
