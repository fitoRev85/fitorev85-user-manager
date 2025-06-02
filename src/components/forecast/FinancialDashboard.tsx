import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Calculator, AlertCircle, Target, Users, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';

// Importar os novos componentes
import PeriodSelector from './PeriodSelector';
import AlertsPanel from './AlertsPanel';
import ComparativeAnalysis from './ComparativeAnalysis';

interface FinancialDashboardProps {
  propertyId: string;
}

const FinancialDashboard = ({ propertyId }: FinancialDashboardProps) => {
  const { getProperty } = useProperties();
  const currentProperty = getProperty(propertyId);

  const [dadosFinanceiros, setDadosFinanceiros] = useState<any[]>([]);
  const [kpisFinanceiros, setKpisFinanceiros] = useState({
    receitaTotal: 0,
    custoTotal: 0,
    lucroLiquido: 0,
    margemLucro: 0,
    receitaMediaDiaria: 0,
    ocupacaoMedia: 0
  });

  // Estados para o novo sistema de período
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Estados para Estimativa de Custos
  const [estimativaCustos, setEstimativaCustos] = useState({
    quartos: currentProperty?.rooms || 100,
    custosFixosMensais: 150000,
    custosVariaveisPorQuarto: 45,
    precoBaseDiaria: 300,
    ocupacaoAlvo: 75,
    diasMes: 30
  });

  const [resultadosEstimativa, setResultadosEstimativa] = useState({
    custosFixosDiarios: 0,
    custosVariaveisDia: 0,
    custoTotalDia: 0,
    receitaDiaria: 0,
    lucroBreakeven: 0,
    margemContribuicao: 0,
    pontoEquilibrio: 0
  });

  // Carregar dados financeiros da propriedade
  useEffect(() => {
    carregarDadosFinanceiros();
    calcularEstimativaCustos();
  }, [propertyId, currentProperty, selectedPeriod, selectedYear, selectedMonth]);

  const carregarDadosFinanceiros = () => {
    try {
      console.log('Carregando dados financeiros para propriedade:', propertyId, 'período:', selectedPeriod, selectedYear, selectedMonth);
      
      const indexKey = `data_index_${propertyId}`;
      const index = JSON.parse(localStorage.getItem(indexKey) || '{}');
      console.log('Índice de dados:', index);
      
      let dadosConsolidados: any[] = [];
      let kpis = {
        receitaTotal: 0,
        custoTotal: 0,
        lucroLiquido: 0,
        margemLucro: 0,
        receitaMediaDiaria: 0,
        ocupacaoMedia: 0
      };

      // Tentativa 1: Carregar do formato de importação avançada (novo)
      const reservasKey = `reservas_${propertyId}`;
      const reservasData = JSON.parse(localStorage.getItem(reservasKey) || '{}');
      console.log('Dados de reservas direto:', reservasData);

      if (reservasData.data && Array.isArray(reservasData.data)) {
        console.log(`Encontrados ${reservasData.data.length} registros de reservas (formato novo)`);
        
        reservasData.data.forEach((reserva: any) => {
          const valor = parseFloat(reserva.valor_total || 0);
          const situacao = (reserva.situação || reserva.status || '').toLowerCase();
          
          // Filtrar por período se necessário
          if (reserva.data_checkin && selectedPeriod === 'month') {
            const reservaDate = new Date(reserva.data_checkin);
            const reservaYear = reservaDate.getFullYear();
            const reservaMonth = reservaDate.getMonth() + 1;
            
            if (reservaYear !== selectedYear || reservaMonth !== selectedMonth) {
              return; // Pular esta reserva
            }
          }
          
          console.log('Processando reserva:', { 
            id: reserva.id, 
            valor, 
            situacao,
            campos: Object.keys(reserva)
          });
          
          if (!situacao.includes('cancelada') && !situacao.includes('cancelled') && valor > 0) {
            kpis.receitaTotal += valor;
          }
        });
      }

      // Tentativa 2: Carregar dados do índice (formato antigo)
      if (kpis.receitaTotal === 0 && index.reservas) {
        console.log('Tentando carregar do formato antigo...');
        const dadosReservas = JSON.parse(localStorage.getItem(index.reservas.storageKey) || '{}');
        console.log('Dados do índice antigo:', dadosReservas);
        
        if (dadosReservas.data) {
          dadosReservas.data.forEach((reserva: any) => {
            const valor = parseFloat(reserva.valor_total || 0);
            const situacao = (reserva.situação || '').toLowerCase();
            
            if (!situacao.includes('cancelada') && valor > 0) {
              kpis.receitaTotal += valor;
            }
          });
          
          console.log(`Receita total das reservas (formato antigo): R$ ${kpis.receitaTotal.toFixed(2)}`);
        }
      }

      // Carregar dados de custos
      if (index.custos) {
        const dadosCustos = JSON.parse(localStorage.getItem(index.custos.storageKey) || '{}');
        if (dadosCustos.data) {
          dadosCustos.data.forEach((custo: any) => {
            const valor = parseFloat(custo.valor || custo.custo || 0);
            if (valor > 0) {
              kpis.custoTotal += valor;
            }
          });
          
          console.log(`Custo total: R$ ${kpis.custoTotal.toFixed(2)}`);
        }
      }

      // Calcular métricas derivadas
      kpis.lucroLiquido = kpis.receitaTotal - kpis.custoTotal;
      kpis.margemLucro = kpis.receitaTotal > 0 ? (kpis.lucroLiquido / kpis.receitaTotal) * 100 : 0;
      kpis.receitaMediaDiaria = kpis.receitaTotal / 30; // Assumindo um mês
      kpis.ocupacaoMedia = currentProperty?.occupancy || 75;

      console.log('KPIs finais calculados:', kpis);

      // Gerar dados mensais para gráficos
      const mesesData = [
        { mes: 'Jan', receita: Math.round(kpis.receitaTotal * 0.8), custos: Math.round(kpis.custoTotal * 0.85), lucro: 0 },
        { mes: 'Fev', receita: Math.round(kpis.receitaTotal * 0.9), custos: Math.round(kpis.custoTotal * 0.90), lucro: 0 },
        { mes: 'Mar', receita: Math.round(kpis.receitaTotal * 1.1), custos: Math.round(kpis.custoTotal * 0.95), lucro: 0 },
        { mes: 'Abr', receita: Math.round(kpis.receitaTotal * 1.2), custos: Math.round(kpis.custoTotal * 1.0), lucro: 0 },
        { mes: 'Mai', receita: Math.round(kpis.receitaTotal), custos: Math.round(kpis.custoTotal), lucro: 0 },
        { mes: 'Jun', receita: Math.round(kpis.receitaTotal * 1.1), custos: Math.round(kpis.custoTotal * 0.98), lucro: 0 }
      ];

      // Calcular lucro para cada mês
      mesesData.forEach(item => {
        item.lucro = item.receita - item.custos;
      });

      setDadosFinanceiros(mesesData);
      setKpisFinanceiros(kpis);

      console.log('KPIs Financeiros atualizados:', kpis);

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    }
  };

  // Gerar dados comparativos
  const comparativeFinancialData = React.useMemo(() => {
    const periods = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
    
    return periods.map(period => ({
      period,
      atual: kpisFinanceiros.receitaTotal / 4 + Math.random() * 10000,
      anoAnterior: (kpisFinanceiros.receitaTotal / 4) * 0.82 + Math.random() * 8000,
      mesAnterior: (kpisFinanceiros.receitaTotal / 4) * 0.94 + Math.random() * 9000,
      mlForecast: (kpisFinanceiros.receitaTotal / 4) * 1.08 + Math.random() * 11000
    }));
  }, [kpisFinanceiros]);

  // Carregar dados financeiros da propriedade
  useEffect(() => {
    carregarDadosFinanceiros();
    calcularEstimativaCustos();
  }, [propertyId, currentProperty, selectedPeriod, selectedYear, selectedMonth]);

  const calcularEstimativaCustos = () => {
    const { quartos, custosFixosMensais, custosVariaveisPorQuarto, precoBaseDiaria, ocupacaoAlvo, diasMes } = estimativaCustos;
    
    // Cálculos base
    const custosFixosDiarios = custosFixosMensais / diasMes;
    const quartosOcupados = Math.round(quartos * (ocupacaoAlvo / 100));
    const custosVariaveisDia = quartosOcupados * custosVariaveisPorQuarto;
    const custoTotalDia = custosFixosDiarios + custosVariaveisDia;
    const receitaDiaria = quartosOcupados * precoBaseDiaria;
    const lucroBreakeven = receitaDiaria - custoTotalDia;
    const margemContribuicao = receitaDiaria > 0 ? ((receitaDiaria - custosVariaveisDia) / receitaDiaria) * 100 : 0;
    const pontoEquilibrio = custosVariaveisPorQuarto > 0 ? custosFixosDiarios / (precoBaseDiaria - custosVariaveisPorQuarto) : 0;

    setResultadosEstimativa({
      custosFixosDiarios,
      custosVariaveisDia,
      custoTotalDia,
      receitaDiaria,
      lucroBreakeven,
      margemContribuicao,
      pontoEquilibrio
    });
  };

  useEffect(() => {
    calcularEstimativaCustos();
  }, [estimativaCustos]);

  const atualizarEstimativa = (campo: string, valor: string) => {
    setEstimativaCustos(prev => ({
      ...prev,
      [campo]: parseFloat(valor) || 0
    }));
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const dadosBreakeven = [
    { ocupacao: 50, receita: (estimativaCustos.quartos * 0.5) * estimativaCustos.precoBaseDiaria, custos: resultadosEstimativa.custosFixosDiarios + ((estimativaCustos.quartos * 0.5) * estimativaCustos.custosVariaveisPorQuarto) },
    { ocupacao: 60, receita: (estimativaCustos.quartos * 0.6) * estimativaCustos.precoBaseDiaria, custos: resultadosEstimativa.custosFixosDiarios + ((estimativaCustos.quartos * 0.6) * estimativaCustos.custosVariaveisPorQuarto) },
    { ocupacao: 70, receita: (estimativaCustos.quartos * 0.7) * estimativaCustos.precoBaseDiaria, custos: resultadosEstimativa.custosFixosDiarios + ((estimativaCustos.quartos * 0.7) * estimativaCustos.custosVariaveisPorQuarto) },
    { ocupacao: 80, receita: (estimativaCustos.quartos * 0.8) * estimativaCustos.precoBaseDiaria, custos: resultadosEstimativa.custosFixosDiarios + ((estimativaCustos.quartos * 0.8) * estimativaCustos.custosVariaveisPorQuarto) },
    { ocupacao: 90, receita: (estimativaCustos.quartos * 0.9) * estimativaCustos.precoBaseDiaria, custos: resultadosEstimativa.custosFixosDiarios + ((estimativaCustos.quartos * 0.9) * estimativaCustos.custosVariaveisPorQuarto) },
    { ocupacao: 100, receita: estimativaCustos.quartos * estimativaCustos.precoBaseDiaria, custos: resultadosEstimativa.custosFixosDiarios + (estimativaCustos.quartos * estimativaCustos.custosVariaveisPorQuarto) }
  ];

  // Calcular lucro para cada ponto
  dadosBreakeven.forEach(item => {
    (item as any).lucro = item.receita - item.custos;
  });

  if (!currentProperty) {
    return (
      <div className="text-center text-slate-400 py-12">
        <p>Propriedade não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Dashboard Financeiro</h2>
              <p className="text-slate-400">{currentProperty.name} • {currentProperty.rooms} quartos</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                {formatarMoeda(kpisFinanceiros.lucroLiquido)}
              </p>
              <p className="text-sm text-slate-400">Lucro Líquido</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Período */}
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onPeriodChange={setSelectedPeriod}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      <Tabs defaultValue="comparative" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="comparative" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <TrendingUpIcon className="w-4 h-4 mr-2" />
            Análise Comparativa
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <BarChart className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="estimativa" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Calculator className="w-4 h-4 mr-2" />
            Estimativa de Custos
          </TabsTrigger>
          <TabsTrigger value="breakeven" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Target className="w-4 h-4 mr-2" />
            Análise Breakeven
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparative" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ComparativeAnalysis 
                data={comparativeFinancialData}
                title="Receita Financeira"
                type="revenue"
              />
            </div>
            <div>
              <AlertsPanel 
                propertyId={propertyId}
                currentMetrics={{
                  adr: kpisFinanceiros.receitaMediaDiaria,
                  occupancy: kpisFinanceiros.ocupacaoMedia,
                  revenue: kpisFinanceiros.receitaTotal,
                  forecast: kpisFinanceiros.receitaTotal * 1.1
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs Financeiros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatarMoeda(kpisFinanceiros.receitaTotal)}</div>
                <p className="text-xs text-slate-400">
                  Média diária: {formatarMoeda(kpisFinanceiros.receitaMediaDiaria)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Custos Totais</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatarMoeda(kpisFinanceiros.custoTotal)}</div>
                <p className="text-xs text-slate-400">
                  % da receita: {kpisFinanceiros.receitaTotal > 0 ? ((kpisFinanceiros.custoTotal/kpisFinanceiros.receitaTotal)*100).toFixed(1) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Margem de Lucro</CardTitle>
                <Target className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${kpisFinanceiros.margemLucro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {kpisFinanceiros.margemLucro.toFixed(1)}%
                </div>
                <p className="text-xs text-slate-400">
                  Lucro: {formatarMoeda(kpisFinanceiros.lucroLiquido)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Ocupação Média</CardTitle>
                <Users className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{kpisFinanceiros.ocupacaoMedia.toFixed(1)}%</div>
                <p className="text-xs text-slate-400">
                  RevPAR: {formatarMoeda(currentProperty.revpar || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Receita vs Custos Mensais</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosFinanceiros}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="mes" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatarMoeda(value), name === 'receita' ? 'Receita' : name === 'custos' ? 'Custos' : 'Lucro']}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    />
                    <Bar dataKey="receita" fill="#10b981" name="receita" />
                    <Bar dataKey="custos" fill="#ef4444" name="custos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Evolução do Lucro</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosFinanceiros}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="mes" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [formatarMoeda(value), 'Lucro']}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="estimativa" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quartos" className="text-slate-300">Número de Quartos</Label>
                    <Input
                      id="quartos"
                      type="number"
                      value={estimativaCustos.quartos}
                      onChange={(e) => atualizarEstimativa('quartos', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ocupacao" className="text-slate-300">Ocupação Alvo (%)</Label>
                    <Input
                      id="ocupacao"
                      type="number"
                      value={estimativaCustos.ocupacaoAlvo}
                      onChange={(e) => atualizarEstimativa('ocupacaoAlvo', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="custosFixos" className="text-slate-300">Custos Fixos Mensais (R$)</Label>
                  <Input
                    id="custosFixos"
                    type="number"
                    value={estimativaCustos.custosFixosMensais}
                    onChange={(e) => atualizarEstimativa('custosFixosMensais', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="custosVariaveis" className="text-slate-300">Custos Variáveis por Quarto (R$)</Label>
                  <Input
                    id="custosVariaveis"
                    type="number"
                    value={estimativaCustos.custosVariaveisPorQuarto}
                    onChange={(e) => atualizarEstimativa('custosVariaveisPorQuarto', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="precoBase" className="text-slate-300">Preço Base Diária (R$)</Label>
                  <Input
                    id="precoBase"
                    type="number"
                    value={estimativaCustos.precoBaseDiaria}
                    onChange={(e) => atualizarEstimativa('precoBaseDiaria', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resultados */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Resultados da Estimativa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">Custos Fixos/Dia</p>
                    <p className="text-lg font-bold text-white">{formatarMoeda(resultadosEstimativa.custosFixosDiarios)}</p>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">Custos Variáveis/Dia</p>
                    <p className="text-lg font-bold text-white">{formatarMoeda(resultadosEstimativa.custosVariaveisDia)}</p>
                  </div>
                </div>

                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <p className="text-sm text-slate-400">Custo Total Diário</p>
                  <p className="text-xl font-bold text-red-400">{formatarMoeda(resultadosEstimativa.custoTotalDia)}</p>
                </div>

                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <p className="text-sm text-slate-400">Receita Diária Estimada</p>
                  <p className="text-xl font-bold text-green-400">{formatarMoeda(resultadosEstimativa.receitaDiaria)}</p>
                </div>

                <div className={`bg-slate-700/30 p-3 rounded-lg border ${resultadosEstimativa.lucroBreakeven >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
                  <p className="text-sm text-slate-400">Lucro/Prejuízo Diário</p>
                  <p className={`text-xl font-bold ${resultadosEstimativa.lucroBreakeven >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatarMoeda(resultadosEstimativa.lucroBreakeven)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">Margem de Contribuição</p>
                    <p className="text-lg font-bold text-blue-400">{resultadosEstimativa.margemContribuicao.toFixed(1)}%</p>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">Ponto de Equilíbrio</p>
                    <p className="text-lg font-bold text-yellow-400">{resultadosEstimativa.pontoEquilibrio.toFixed(0)} quartos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakeven" className="space-y-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Análise de Breakeven por Ocupação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dadosBreakeven}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="ocupacao" stroke="#94a3b8" tickFormatter={(value) => `${value}%`} />
                  <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatarMoeda(value), 
                      name === 'receita' ? 'Receita' : name === 'custos' ? 'Custos' : 'Lucro'
                    ]}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} name="receita" />
                  <Line type="monotone" dataKey="custos" stroke="#ef4444" strokeWidth={3} name="custos" />
                  <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={3} name="lucro" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela de Breakeven */}
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Tabela de Breakeven</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300">Ocupação</th>
                      <th className="text-right py-3 px-4 text-slate-300">Quartos</th>
                      <th className="text-right py-3 px-4 text-slate-300">Receita</th>
                      <th className="text-right py-3 px-4 text-slate-300">Custos</th>
                      <th className="text-right py-3 px-4 text-slate-300">Lucro/Prejuízo</th>
                      <th className="text-center py-3 px-4 text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosBreakeven.map((item, index) => {
                      const quartosOcupados = Math.round(estimativaCustos.quartos * (item.ocupacao / 100));
                      const lucro = (item as any).lucro;
                      const isBreakeven = lucro >= 0;
                      
                      return (
                        <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-4 text-white font-medium">{item.ocupacao}%</td>
                          <td className="py-3 px-4 text-right text-slate-300">{quartosOcupados}</td>
                          <td className="py-3 px-4 text-right text-green-400">{formatarMoeda(item.receita)}</td>
                          <td className="py-3 px-4 text-right text-red-400">{formatarMoeda(item.custos)}</td>
                          <td className={`py-3 px-4 text-right font-medium ${isBreakeven ? 'text-green-400' : 'text-red-400'}`}>
                            {formatarMoeda(lucro)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isBreakeven ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {isBreakeven ? '✓ Lucro' : '✗ Prejuízo'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
