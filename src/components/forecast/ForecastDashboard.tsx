import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { TrendingUp, Calendar, Users, DollarSign, AlertTriangle, CheckCircle, Target, Activity } from 'lucide-react';
import { useMetas } from '@/hooks/useMetas';
import { useProperties } from '@/hooks/useProperties';

interface ForecastDashboardProps {
  propertyId: string;
}

const ForecastDashboard = ({ propertyId }: ForecastDashboardProps) => {
  const [kpiData, setKpiData] = useState({
    currentOccupancy: 78.5,
    forecast30Days: 82.3,
    currentRevpar: 225.50,
    forecastRevpar: 248.20,
    totalBookings: 1247,
    cancellationRate: 8.2,
    receitaAtual: 45000,
    metaMesAtual: 50000
  });

  const [dadosReais, setDadosReais] = useState<any[]>([]);
  const [estatisticasUpload, setEstatisticasUpload] = useState({
    totalRegistros: 0,
    receitaTotal: 0,
    reservasAtivas: 0,
    cancelamentos: 0,
    ultimoUpload: null as string | null
  });

  const { obterMetasPropriedade, obterMetaPeriodo } = useMetas();
  const { properties, getProperty } = useProperties();

  // Obter dados da propriedade específica
  const currentProperty = getProperty(propertyId);

  // Dados comparativos específicos da propriedade
  const [dadosComparativos, setDadosComparativos] = useState([
    { 
      mes: 'Jan', 
      real: 45000, 
      meta: 50000, 
      mlForecast: 48000,
      mesAno: '2025-01'
    },
    { 
      mes: 'Fev', 
      real: 52000, 
      meta: 55000, 
      mlForecast: 53000,
      mesAno: '2025-02'
    },
    { 
      mes: 'Mar', 
      real: 48000, 
      meta: 52000, 
      mlForecast: 50000,
      mesAno: '2025-03'
    },
    { 
      mes: 'Abr', 
      real: 58000, 
      meta: 60000, 
      mlForecast: 59000,
      mesAno: '2025-04'
    },
    { 
      mes: 'Mai', 
      real: 0, 
      meta: 62000, 
      mlForecast: 61000,
      mesAno: '2025-05'
    },
    { 
      mes: 'Jun', 
      real: 0, 
      meta: 65000, 
      mlForecast: 63000,
      mesAno: '2025-06'
    }
  ]);

  const [paceData, setPaceData] = useState({
    receitaAtual: 45000,
    diasDecorridos: 15,
    diasNoMes: 31,
    metaMes: 50000,
    paceCalculado: 0,
    percentualMeta: 0,
    status: 'warning'
  });

  // Função para carregar dados uploadados da propriedade
  const carregarDadosUpload = () => {
    try {
      const indexKey = `data_index_${propertyId}`;
      const index = JSON.parse(localStorage.getItem(indexKey) || '{}');
      
      console.log(`Buscando dados para propriedade ${propertyId}:`, index);
      
      let todosOsDados: any[] = [];
      let estatisticas = {
        totalRegistros: 0,
        receitaTotal: 0,
        reservasAtivas: 0,
        cancelamentos: 0,
        ultimoUpload: null as string | null
      };

      // Carregar dados de reservas
      if (index.reservas) {
        const dadosReservas = JSON.parse(localStorage.getItem(index.reservas.storageKey) || '{}');
        if (dadosReservas.data) {
          todosOsDados = [...todosOsDados, ...dadosReservas.data];
          
          // Calcular estatísticas das reservas
          dadosReservas.data.forEach((reserva: any) => {
            estatisticas.totalRegistros++;
            
            const valor = parseFloat(reserva.valor_total || reserva['valor_total'] || 0);
            if (!isNaN(valor)) {
              estatisticas.receitaTotal += valor;
            }
            
            const situacao = (reserva.situação || reserva.status || '').toLowerCase();
            if (situacao.includes('cancelada') || situacao.includes('cancelado')) {
              estatisticas.cancelamentos++;
            } else if (situacao.includes('fechada') || situacao.includes('confirmada')) {
              estatisticas.reservasAtivas++;
            }
          });
          
          estatisticas.ultimoUpload = dadosReservas.timestamp;
          console.log(`Dados de reservas carregados: ${dadosReservas.data.length} registros`);
        }
      }

      // Carregar outros tipos de dados
      ['vendas', 'custos', 'eventos'].forEach(tipo => {
        if (index[tipo]) {
          const dados = JSON.parse(localStorage.getItem(index[tipo].storageKey) || '{}');
          if (dados.data) {
            todosOsDados = [...todosOsDados, ...dados.data];
            console.log(`Dados de ${tipo} carregados: ${dados.data.length} registros`);
          }
        }
      });

      setDadosReais(todosOsDados);
      setEstatisticasUpload(estatisticas);
      
      console.log(`Total de dados carregados: ${todosOsDados.length} registros`);
      console.log('Estatísticas:', estatisticas);
      
      // Atualizar KPIs com dados reais
      if (estatisticas.totalRegistros > 0) {
        const taxaCancelamento = estatisticas.cancelamentos > 0 ? 
          (estatisticas.cancelamentos / estatisticas.totalRegistros) * 100 : 0;
        
        setKpiData(prev => ({
          ...prev,
          totalBookings: estatisticas.totalRegistros,
          cancellationRate: taxaCancelamento,
          receitaAtual: estatisticas.receitaTotal
        }));
        
        setPaceData(prev => ({
          ...prev,
          receitaAtual: estatisticas.receitaTotal
        }));
      }

    } catch (error) {
      console.error('Erro ao carregar dados da propriedade:', error);
    }
  };

  useEffect(() => {
    if (currentProperty) {
      // Atualizar KPIs baseados na propriedade
      const baseRevenue = currentProperty.rooms * 200;
      const occupancy = currentProperty.occupancy || 75;
      const adr = currentProperty.adr || 250;
      
      setKpiData(prev => ({
        ...prev,
        currentOccupancy: occupancy,
        currentRevpar: currentProperty.revpar || Math.round(adr * (occupancy / 100)),
        forecastRevpar: Math.round(adr * ((occupancy + 5) / 100)),
        totalBookings: Math.round(currentProperty.rooms * occupancy * 0.3),
        receitaAtual: Math.round(baseRevenue * (occupancy / 100)),
        metaMesAtual: Math.round(baseRevenue * (occupancy / 100) * 1.1)
      }));

      // Atualizar dados comparativos baseados na propriedade
      const scaleFactor = currentProperty.rooms / 120; // 120 quartos como base
      setDadosComparativos(prev => prev.map(item => ({
        ...item,
        real: item.real > 0 ? Math.round(item.real * scaleFactor) : 0,
        meta: Math.round(item.meta * scaleFactor),
        mlForecast: Math.round(item.mlForecast * scaleFactor)
      })));
    }
    
    // Carregar dados uploadados
    carregarDadosUpload();
    
    calcularPace();
    carregarDadosComparativos();
  }, [propertyId, currentProperty]);

  const calcularPace = () => {
    const { receitaAtual, diasDecorridos, diasNoMes, metaMes } = paceData;
    
    if (diasDecorridos > 0) {
      const paceCalculado = (receitaAtual / diasDecorridos) * diasNoMes;
      const percentualMeta = metaMes > 0 ? (paceCalculado / metaMes) * 100 : 0;
      
      let status = 'error';
      if (percentualMeta >= 100) status = 'success';
      else if (percentualMeta >= 90) status = 'warning';
      
      setPaceData(prev => ({
        ...prev,
        paceCalculado,
        percentualMeta,
        status
      }));
    }
  };

  const carregarDadosComparativos = () => {
    if (!propertyId) return;
    
    // Carregar metas reais do sistema para a propriedade específica
    const anoAtual = new Date().getFullYear();
    const metas = obterMetasPropriedade(propertyId, anoAtual);
    
    // Atualizar dados comparativos com metas reais
    const novosComparativos = dadosComparativos.map(item => {
      const metaEncontrada = metas.find(meta => 
        meta.mesAno === item.mesAno && meta.tipoMeta === 'receita'
      );
      
      return {
        ...item,
        meta: metaEncontrada ? metaEncontrada.valorMeta : item.meta
      };
    });
    
    setDadosComparativos(novosComparativos);
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const obterIconeStatus = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === 'real' && 'Real: '}
              {entry.dataKey === 'meta' && 'Meta: '}
              {entry.dataKey === 'mlForecast' && 'ML Forecast: '}
              {formatarValor(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!currentProperty) {
    return (
      <div className="text-center text-slate-400 py-12">
        <p>Propriedade não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Propriedade com Dados de Upload */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{currentProperty.name}</h2>
              <p className="text-slate-400">{currentProperty.location} • {currentProperty.rooms} quartos</p>
              {estatisticasUpload.totalRegistros > 0 && (
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-green-400">
                    📊 {estatisticasUpload.totalRegistros} registros carregados
                  </span>
                  <span className="text-blue-400">
                    💰 Receita: {formatarValor(estatisticasUpload.receitaTotal)}
                  </span>
                  <span className="text-purple-400">
                    ✅ {estatisticasUpload.reservasAtivas} ativas
                  </span>
                  {estatisticasUpload.cancelamentos > 0 && (
                    <span className="text-red-400">
                      ❌ {estatisticasUpload.cancelamentos} canceladas
                    </span>
                  )}
                </div>
              )}
              {estatisticasUpload.ultimoUpload && (
                <p className="text-xs text-slate-500 mt-1">
                  Último upload: {new Date(estatisticasUpload.ultimoUpload).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">
                {formatarValor(kpiData.currentRevpar)}
              </p>
              <p className="text-sm text-slate-400">RevPAR Atual</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais com Pace */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Ocupação Atual</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{kpiData.currentOccupancy}%</div>
            <p className="text-xs text-slate-400">
              Previsão 30 dias: <span className="text-green-400">{kpiData.forecast30Days}%</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">RevPAR</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {kpiData.currentRevpar}</div>
            <p className="text-xs text-slate-400">
              Previsão: <span className="text-green-400">R$ {kpiData.forecastRevpar}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pace vs Meta</CardTitle>
            <Target className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${obterCorStatus(paceData.status)}`}>
              {paceData.percentualMeta.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400">
              Pace: <span className="text-blue-400">{formatarValor(paceData.paceCalculado)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{kpiData.totalBookings.toLocaleString()}</div>
            <p className="text-xs text-slate-400">
              Cancelamentos: <span className="text-red-400">{kpiData.cancellationRate.toFixed(1)}%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Performance */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {obterIconeStatus(paceData.status)}
            Alertas de Performance - {currentProperty.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg border ${
            paceData.status === 'success' ? 'bg-green-500/20 border-green-500/30' :
            paceData.status === 'warning' ? 'bg-yellow-500/20 border-yellow-500/30' :
            'bg-red-500/20 border-red-500/30'
          }`}>
            {paceData.status === 'success' && (
              <p className="text-green-400 font-medium">
                🎉 Excelente! O pace atual está {paceData.percentualMeta.toFixed(1)}% da meta
              </p>
            )}
            {paceData.status === 'warning' && (
              <p className="text-yellow-400 font-medium">
                ⚠️ Atenção: Pace em {paceData.percentualMeta.toFixed(1)}% da meta - Requer atenção
              </p>
            )}
            {paceData.status === 'error' && (
              <p className="text-red-400 font-medium">
                🚨 Crítico: Pace apenas {paceData.percentualMeta.toFixed(1)}% da meta - Ação necessária
              </p>
            )}
            <div className="mt-2 text-sm text-slate-300">
              <span>Receita atual: {formatarValor(paceData.receitaAtual)} • </span>
              <span>Meta do mês: {formatarValor(paceData.metaMes)} • </span>
              <span>Dias decorridos: {paceData.diasDecorridos}/{paceData.diasNoMes}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos Comparativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Real vs Meta vs ML Forecast */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Real vs Meta vs ML Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dadosComparativos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="real" fill="#10b981" name="Real" opacity={0.8} />
                <Line type="monotone" dataKey="meta" stroke="#ef4444" strokeWidth={3} name="Meta" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="mlForecast" stroke="#3b82f6" strokeWidth={2} name="ML Forecast" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Performance Mensal */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Performance vs Meta Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosComparativos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`, 
                    name === 'percentualMeta' ? 'Atingimento da Meta' : name
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }} 
                />
                <Bar 
                  dataKey={(item: any) => item.real > 0 ? (item.real / item.meta) * 100 : 0} 
                  fill="#3b82f6" 
                  name="percentualMeta"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Detalhamento Mensal - {currentProperty.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Mês</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">Real</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">Meta</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">ML Forecast</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-medium">Atingimento</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {dadosComparativos.map((item, index) => {
                  const atingimento = item.real > 0 ? (item.real / item.meta) * 100 : 0;
                  const statusItem = atingimento >= 100 ? 'success' : atingimento >= 90 ? 'warning' : 'error';
                  
                  return (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-white font-medium">{item.mes}</td>
                      <td className="py-3 px-4 text-right text-white">
                        {item.real > 0 ? formatarValor(item.real) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">{formatarValor(item.meta)}</td>
                      <td className="py-3 px-4 text-right text-blue-400">{formatarValor(item.mlForecast)}</td>
                      <td className={`py-3 px-4 text-center font-medium ${
                        item.real > 0 ? obterCorStatus(statusItem) : 'text-slate-500'
                      }`}>
                        {item.real > 0 ? `${atingimento.toFixed(1)}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.real > 0 ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            statusItem === 'success' ? 'bg-green-500/20 text-green-400' :
                            statusItem === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {statusItem === 'success' ? '✓ Meta' : 
                             statusItem === 'warning' ? '⚠ Próximo' : '✗ Abaixo'}
                          </span>
                        ) : (
                          <span className="text-slate-500">Pendente</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info - Dados Carregados */}
      {dadosReais.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Dados Carregados - Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-green-400">✅ {dadosReais.length} registros carregados com sucesso</p>
              <p className="text-blue-400">🏨 Propriedade: {propertyId}</p>
              <p className="text-purple-400">📊 Tipos de dados encontrados: 
                {Object.keys(JSON.parse(localStorage.getItem(`data_index_${propertyId}`) || '{}')).join(', ')}
              </p>
              <details className="text-slate-300">
                <summary className="cursor-pointer hover:text-white">Ver amostra dos dados</summary>
                <pre className="mt-2 p-3 bg-slate-900/50 rounded text-xs overflow-x-auto">
                  {JSON.stringify(dadosReais.slice(0, 3), null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ForecastDashboard;
