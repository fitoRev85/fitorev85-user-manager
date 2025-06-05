
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents } from '@/hooks/useEvents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, Users, DollarSign, Target } from 'lucide-react';

interface HistoricalAnalysisProps {
  propertyId: string;
}

const HistoricalAnalysis = ({ propertyId }: HistoricalAnalysisProps) => {
  const { obterEventosPropriedade, obterPeriodosSazonaisPropriedade } = useEvents();
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('occupancy');

  const eventos = obterEventosPropriedade(propertyId);
  const periodos = obterPeriodosSazonaisPropriedade(propertyId);

  const tiposEvento = [
    { value: 'all', label: 'Todos os Eventos' },
    { value: 'feriado', label: 'Feriados' },
    { value: 'evento_local', label: 'Eventos Locais' },
    { value: 'congresso', label: 'Congressos' },
    { value: 'feira', label: 'Feiras' },
    { value: 'show', label: 'Shows' },
    { value: 'esportivo', label: 'Eventos Esportivos' }
  ];

  const metricas = [
    { value: 'occupancy', label: 'Impacto na Ocupação', icon: Users },
    { value: 'adr', label: 'Impacto no ADR', icon: DollarSign }
  ];

  // Simulação de dados históricos baseados nos eventos configurados
  const dadosHistoricos = useMemo(() => {
    const eventosFiltered = selectedEventType === 'all' 
      ? eventos 
      : eventos.filter(e => e.tipo === selectedEventType);

    return eventosFiltered.map((evento, index) => {
      // Simulando dados históricos baseados no impacto configurado
      const baseOccupancy = 75 + (Math.random() * 20 - 10); // 65-85%
      const baseADR = 250 + (Math.random() * 100 - 50); // R$ 200-300

      const occupancyWithEvent = baseOccupancy * (1 + evento.impactoOcupacao / 100);
      const adrWithEvent = baseADR * (1 + evento.impactoADR / 100);

      return {
        nome: evento.nome,
        ano: new Date().getFullYear() - (index % 3), // Simula 3 anos de histórico
        ocupacaoBase: Math.round(baseOccupancy),
        ocupacaoComEvento: Math.round(occupancyWithEvent),
        adrBase: Math.round(baseADR),
        adrComEvento: Math.round(adrWithEvent),
        impactoOcupacao: evento.impactoOcupacao,
        impactoADR: evento.impactoADR,
        tipo: evento.tipo,
        nivel: evento.impacto
      };
    });
  }, [eventos, selectedEventType]);

  const resumoAnalise = useMemo(() => {
    if (dadosHistoricos.length === 0) return null;

    const impactoMedioOcupacao = dadosHistoricos.reduce((acc, curr) => acc + curr.impactoOcupacao, 0) / dadosHistoricos.length;
    const impactoMedioADR = dadosHistoricos.reduce((acc, curr) => acc + curr.impactoADR, 0) / dadosHistoricos.length;
    
    const eventosAltoImpacto = dadosHistoricos.filter(d => d.nivel === 'alto').length;
    const eventosMedioImpacto = dadosHistoricos.filter(d => d.nivel === 'medio').length;
    const eventosBaixoImpacto = dadosHistoricos.filter(d => d.nivel === 'baixo').length;

    return {
      impactoMedioOcupacao: Math.round(impactoMedioOcupacao),
      impactoMedioADR: Math.round(impactoMedioADR),
      eventosAltoImpacto,
      eventosMedioImpacto,
      eventosBaixoImpacto,
      totalEventos: dadosHistoricos.length
    };
  }, [dadosHistoricos]);

  const chartData = useMemo(() => {
    return dadosHistoricos.map(d => ({
      nome: d.nome.length > 15 ? d.nome.substring(0, 15) + '...' : d.nome,
      base: selectedMetric === 'occupancy' ? d.ocupacaoBase : d.adrBase,
      comEvento: selectedMetric === 'occupancy' ? d.ocupacaoComEvento : d.adrComEvento,
      impacto: selectedMetric === 'occupancy' ? d.impactoOcupacao : d.impactoADR
    }));
  }, [dadosHistoricos, selectedMetric]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Análise Histórica</h2>
          <p className="text-slate-400">Performance histórica de eventos similares</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {tiposEvento.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value} className="text-white">
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {metricas.map((metrica) => (
                <SelectItem key={metrica.value} value={metrica.value} className="text-white">
                  {metrica.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumo da Análise */}
      {resumoAnalise && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Impacto Médio Ocupação</p>
                  <p className="text-lg font-bold text-white">+{resumoAnalise.impactoMedioOcupacao}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Impacto Médio ADR</p>
                  <p className="text-lg font-bold text-white">+{resumoAnalise.impactoMedioADR}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Alto Impacto</p>
                  <p className="text-lg font-bold text-white">{resumoAnalise.eventosAltoImpacto}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total de Eventos</p>
                  <p className="text-lg font-bold text-white">{resumoAnalise.totalEventos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Comparação */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">
            Performance: {metricas.find(m => m.value === selectedMetric)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum dado histórico disponível</p>
              <p className="text-sm text-slate-500 mt-2">
                Configure eventos para ver a análise histórica
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="nome" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any, name: string) => [
                    selectedMetric === 'occupancy' ? `${value}%` : `R$ ${value}`,
                    name === 'base' ? 'Sem Evento' : 'Com Evento'
                  ]}
                />
                <Bar dataKey="base" fill="#64748B" name="Sem Evento" />
                <Bar dataKey="comEvento" fill="#8B5CF6" name="Com Evento" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Lista Detalhada */}
      {dadosHistoricos.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Detalhamento por Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosHistoricos.map((evento, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{evento.nome}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {evento.tipo.replace('_', ' ')}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            evento.nivel === 'alto' ? 'bg-red-500' :
                            evento.nivel === 'medio' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        >
                          {evento.nivel} impacto
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Ano {evento.ano}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-slate-400">Ocupação Base</p>
                      <p className="text-white font-medium">{evento.ocupacaoBase}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Ocupação c/ Evento</p>
                      <p className="text-white font-medium">{evento.ocupacaoComEvento}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400">ADR Base</p>
                      <p className="text-white font-medium">R$ {evento.adrBase}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">ADR c/ Evento</p>
                      <p className="text-white font-medium">R$ {evento.adrComEvento}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HistoricalAnalysis;
