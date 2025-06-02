
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, TrendingUp, TrendingDown, Percent, 
  RefreshCw, CheckCircle, AlertTriangle, Calendar,
  BarChart3, LineChart, PieChart
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, 
  Bar, PieChart as RechartsPieChart, Cell
} from 'recharts';

import PeriodSelector from './PeriodSelector';
import AlertsPanel from './AlertsPanel';
import { useReservationData } from '@/hooks/useReservationData';

interface FinancialDashboardProps {
  propertyId: string;
}

const FinancialDashboard = ({ propertyId }: FinancialDashboardProps) => {
  // Usar o hook centralizado de dados
  const { data: reservas, loading, lastUpdate, totalRecords, refreshData } = useReservationData(propertyId);
  
  // Estados para o sistema de período
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Filtrar dados baseado no período selecionado
  const filteredData = React.useMemo(() => {
    if (reservas.length === 0) return [];

    return reservas.filter(reserva => {
      if (!reserva.data_checkin) return false;
      
      const reservaDate = new Date(reserva.data_checkin);
      const reservaYear = reservaDate.getFullYear();
      const reservaMonth = reservaDate.getMonth() + 1;

      if (selectedPeriod === 'month') {
        return reservaYear === selectedYear && reservaMonth === selectedMonth;
      } else if (selectedPeriod === 'year') {
        return reservaYear === selectedYear;
      }
      
      return true;
    });
  }, [reservas, selectedPeriod, selectedYear, selectedMonth]);

  // Calcular KPIs financeiros baseados nos dados reais
  const kpis = React.useMemo(() => {
    if (filteredData.length === 0) {
      return {
        receitaTotal: 0,
        custoTotal: 0,
        lucroLiquido: 0,
        margemLucro: 0,
        receitaMediaDiaria: 0,
        ocupacaoMedia: 0
      };
    }

    const reservasConfirmadas = filteredData.filter(r => 
      r.situacao && !['cancelada', 'canceled', 'cancelled'].includes(r.situacao.toLowerCase())
    );

    const receitaTotal = reservasConfirmadas.reduce((sum, r) => sum + (r.valor_total || 0), 0);
    
    // Simular custos (30% da receita)
    const custoTotal = receitaTotal * 0.3;
    const lucroLiquido = receitaTotal - custoTotal;
    const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

    // Calcular média diária
    const dates = [...new Set(reservasConfirmadas.map(r => r.data_checkin?.split('T')[0]))].filter(Boolean);
    const receitaMediaDiaria = dates.length > 0 ? receitaTotal / dates.length : 0;

    // Calcular ocupação média
    const totalNoites = reservasConfirmadas.reduce((sum, r) => sum + (r.noites || 1), 0);
    const quartosDisponiveis = dates.length * 100; // Assumindo 100 quartos
    const ocupacaoMedia = quartosDisponiveis > 0 ? (totalNoites / quartosDisponiveis) * 100 : 0;

    console.log('💰 KPIs Financeiros calculados:', {
      receitaTotal,
      custoTotal,
      lucroLiquido,
      margemLucro,
      receitaMediaDiaria,
      ocupacaoMedia
    });

    return {
      receitaTotal,
      custoTotal,
      lucroLiquido,
      margemLucro,
      receitaMediaDiaria,
      ocupacaoMedia
    };
  }, [filteredData]);

  // Dados de receita por dia
  const receitaData = React.useMemo(() => {
    if (filteredData.length === 0) return [];

    const dataMap = new Map();
    
    filteredData.forEach(reserva => {
      if (!reserva.data_checkin) return;
      
      const date = reserva.data_checkin.split('T')[0];
      
      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date,
          receita: 0,
          custo: 0,
          lucro: 0
        });
      }
      
      const dayData = dataMap.get(date);
      const receita = reserva.valor_total || 0;
      dayData.receita += receita;
      dayData.custo += receita * 0.3; // 30% de custo
      dayData.lucro = dayData.receita - dayData.custo;
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Dados de comparação mensal
  const comparativoData = React.useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return meses.map((mes, index) => {
      const baseReceita = kpis.receitaTotal / 12;
      const variacao = (Math.random() - 0.5) * 0.4; // ±20% de variação
      
      return {
        mes,
        atual: baseReceita * (1 + variacao),
        anoAnterior: baseReceita * 0.85 * (1 + variacao),
        forecast: baseReceita * 1.1 * (1 + variacao)
      };
    });
  }, [kpis.receitaTotal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-white">Carregando dados financeiros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Financeiro</h2>
          <p className="text-slate-400">
            Propriedade: {propertyId} • 
            {lastUpdate && ` Última atualização: ${new Date(lastUpdate).toLocaleString('pt-BR')}`}
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Seletor de Período */}
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onPeriodChange={setSelectedPeriod}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        showComparisons={false}
      />

      {/* Status dos Dados */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {totalRecords > 0 ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  {filteredData.length} registros financeiros no período ({totalRecords} total)
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  Nenhum dado financeiro encontrado - importe dados via módulo de Dados
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid com KPIs e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* KPIs Principais */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Receita Total</p>
                    <p className="text-white text-xl font-bold">
                      R$ {kpis.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Custo Total</p>
                    <p className="text-white text-xl font-bold">
                      R$ {kpis.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Lucro Líquido</p>
                    <p className="text-white text-xl font-bold">
                      R$ {kpis.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Percent className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Margem de Lucro</p>
                    <p className="text-white text-xl font-bold">{kpis.margemLucro.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Receita Média/Dia</p>
                    <p className="text-white text-xl font-bold">
                      R$ {kpis.receitaMediaDiaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Percent className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Ocupação Média</p>
                    <p className="text-white text-xl font-bold">{kpis.ocupacaoMedia.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Painel de Alertas */}
        <div>
          <AlertsPanel 
            propertyId={propertyId}
            currentMetrics={{
              adr: kpis.receitaMediaDiaria,
              occupancy: kpis.ocupacaoMedia,
              revenue: kpis.receitaTotal,
              forecast: kpis.receitaTotal * 1.1
            }}
          />
        </div>
      </div>

      {/* Gráficos Financeiros */}
      {totalRecords > 0 && (
        <Tabs defaultValue="receita-diaria" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="receita-diaria" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <LineChart className="w-4 h-4 mr-2" />
              Receita Diária
            </TabsTrigger>
            <TabsTrigger value="comparativo" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Comparativo Mensal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receita-diaria" className="space-y-4">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Performance Financeira Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLineChart data={receitaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="receita" 
                      stroke="#10B981" 
                      name="Receita"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="custo" 
                      stroke="#EF4444" 
                      name="Custo"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lucro" 
                      stroke="#3B82F6" 
                      name="Lucro"
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparativo" className="space-y-4">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Comparativo de Receita Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart data={comparativoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="mes" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="atual" fill="#3B82F6" name="Atual" />
                    <Bar dataKey="anoAnterior" fill="#10B981" name="Ano Anterior" />
                    <Bar dataKey="forecast" fill="#8B5CF6" name="Forecast" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default FinancialDashboard;
