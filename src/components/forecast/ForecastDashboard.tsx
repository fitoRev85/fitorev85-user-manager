
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { TrendingUp, Calendar, Users, DollarSign, AlertTriangle, CheckCircle, Target, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMetas } from '@/hooks/useMetas';
import { useProperties } from '@/hooks/useProperties';

interface ForecastDashboardProps {
  propertyId: string;
}

const ForecastDashboard = ({ propertyId }: ForecastDashboardProps) => {
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  
  const [kpiData, setKpiData] = useState({
    mesAtual: {
      receita: 0,
      reservas: 0,
      ocupacao: 0,
      adr: 0,
      revpar: 0,
      cancelamentos: 0
    },
    anoAnterior: {
      receita: 0,
      reservas: 0,
      ocupacao: 0,
      adr: 0,
      revpar: 0,
      cancelamentos: 0
    },
    previsao: {
      receita: 0,
      reservas: 0,
      ocupacao: 0,
      adr: 0,
      revpar: 0
    }
  });

  const [dadosHistoricos, setDadosHistoricos] = useState<any[]>([]);
  const [dadosComparativos, setDadosComparativos] = useState<any[]>([]);
  const [estatisticasUpload, setEstatisticasUpload] = useState({
    totalRegistros: 0,
    periodoCobertura: '',
    ultimoUpload: null as string | null
  });

  const { obterMetasPropriedade } = useMetas();
  const { getProperty } = useProperties();

  const currentProperty = getProperty(propertyId);

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Função para processar dados históricos do CSV
  const processarDadosHistoricos = () => {
    try {
      const indexKey = `data_index_${propertyId}`;
      const index = JSON.parse(localStorage.getItem(indexKey) || '{}');
      
      let todosOsDados: any[] = [];
      let estatisticas = {
        totalRegistros: 0,
        periodoCobertura: '',
        ultimoUpload: null as string | null
      };

      // Carregar dados de todos os tipos
      Object.keys(index).forEach(tipo => {
        if (index[tipo]) {
          const dados = JSON.parse(localStorage.getItem(index[tipo].storageKey) || '{}');
          if (dados.data && Array.isArray(dados.data)) {
            console.log(`Processando ${dados.data.length} registros de ${tipo}`);
            
            dados.data.forEach((registro: any) => {
              // Normalizar diferentes formatos de data
              let dataCheckIn = null;
              let dataCheckOut = null;
              let valor = 0;
              let situacao = '';

              // Detectar formato bookingInternalID (novo formato)
              if (registro.checkInDateTime && registro.checkOutDateTime) {
                dataCheckIn = new Date(registro.checkInDateTime);
                dataCheckOut = new Date(registro.checkOutDateTime);
                valor = parseFloat(registro.totalBookingRate || 0);
                situacao = registro.channelDescription || 'ativa';
              }
              // Formato anterior
              else if (registro.data_checkin || registro['data_check_in']) {
                const checkinStr = registro.data_checkin || registro['data_check_in'];
                dataCheckIn = new Date(checkinStr);
                if (registro.data_checkout || registro['data_check_out']) {
                  dataCheckOut = new Date(registro.data_checkout || registro['data_check_out']);
                }
                valor = parseFloat(registro.valor_total || registro.valor || 0);
                situacao = registro.situacao || registro.status || 'ativa';
              }

              if (dataCheckIn && !isNaN(dataCheckIn.getTime())) {
                todosOsDados.push({
                  ...registro,
                  dataCheckIn,
                  dataCheckOut,
                  valor,
                  situacao: situacao.toLowerCase(),
                  mes: dataCheckIn.getMonth(),
                  ano: dataCheckIn.getFullYear(),
                  tipo
                });
                estatisticas.totalRegistros++;
              }
            });

            estatisticas.ultimoUpload = dados.timestamp;
          }
        }
      });

      // Determinar período de cobertura
      if (todosOsDados.length > 0) {
        const datasOrdenadas = todosOsDados
          .map(d => d.dataCheckIn)
          .sort((a, b) => a.getTime() - b.getTime());
        
        const dataInicio = datasOrdenadas[0];
        const dataFim = datasOrdenadas[datasOrdenadas.length - 1];
        
        estatisticas.periodoCobertura = `${dataInicio.toLocaleDateString('pt-BR')} - ${dataFim.toLocaleDateString('pt-BR')}`;
      }

      setDadosHistoricos(todosOsDados);
      setEstatisticasUpload(estatisticas);
      
      console.log(`Dados processados: ${todosOsDados.length} registros`);
      console.log('Período:', estatisticas.periodoCobertura);

    } catch (error) {
      console.error('Erro ao processar dados históricos:', error);
    }
  };

  // Função para calcular KPIs do mês selecionado
  const calcularKPIsMes = () => {
    if (dadosHistoricos.length === 0) return;

    // Dados do mês atual selecionado
    const dadosMesAtual = dadosHistoricos.filter(d => 
      d.mes === mesSelecionado && d.ano === anoSelecionado
    );

    // Dados do mesmo mês no ano anterior
    const dadosAnoAnterior = dadosHistoricos.filter(d => 
      d.mes === mesSelecionado && d.ano === anoSelecionado - 1
    );

    // Calcular métricas para mês atual
    const mesAtual = calcularMetricas(dadosMesAtual);
    const anoAnterior = calcularMetricas(dadosAnoAnterior);

    // Previsão baseada em tendência
    const previsao = {
      receita: mesAtual.receita > 0 ? mesAtual.receita * 1.05 : anoAnterior.receita * 1.1,
      reservas: mesAtual.reservas > 0 ? mesAtual.reservas * 1.02 : anoAnterior.reservas * 1.05,
      ocupacao: mesAtual.ocupacao > 0 ? Math.min(mesAtual.ocupacao * 1.03, 100) : anoAnterior.ocupacao * 1.05,
      adr: mesAtual.adr > 0 ? mesAtual.adr * 1.02 : anoAnterior.adr * 1.08,
      revpar: 0
    };
    previsao.revpar = (previsao.ocupacao / 100) * previsao.adr;

    setKpiData({
      mesAtual,
      anoAnterior,
      previsao
    });
  };

  const calcularMetricas = (dados: any[]) => {
    if (dados.length === 0) {
      return { receita: 0, reservas: 0, ocupacao: 0, adr: 0, revpar: 0, cancelamentos: 0 };
    }

    const reservasAtivas = dados.filter(d => !d.situacao.includes('cancelad'));
    const receita = reservasAtivas.reduce((sum, d) => sum + d.valor, 0);
    const cancelamentos = dados.length - reservasAtivas.length;
    const taxaCancelamento = dados.length > 0 ? (cancelamentos / dados.length) * 100 : 0;

    // Calcular diárias (aproximação)
    let totalDiarias = 0;
    reservasAtivas.forEach(reserva => {
      if (reserva.dataCheckOut && reserva.dataCheckIn) {
        const dias = Math.max(1, Math.ceil((reserva.dataCheckOut - reserva.dataCheckIn) / (1000 * 60 * 60 * 24)));
        totalDiarias += dias;
      } else {
        totalDiarias += 1; // Default para 1 diária se não houver data de saída
      }
    });

    const adr = totalDiarias > 0 ? receita / totalDiarias : 0;
    const quartos = currentProperty?.rooms || 100;
    const diasNoMes = new Date(anoSelecionado, mesSelecionado + 1, 0).getDate();
    const quartosDisponiveis = quartos * diasNoMes;
    const ocupacao = quartosDisponiveis > 0 ? (totalDiarias / quartosDisponiveis) * 100 : 0;
    const revpar = (ocupacao / 100) * adr;

    return {
      receita,
      reservas: reservasAtivas.length,
      ocupacao: Math.min(ocupacao, 100),
      adr,
      revpar,
      cancelamentos: taxaCancelamento
    };
  };

  // Função para gerar dados comparativos dos últimos 12 meses
  const gerarDadosComparativos = () => {
    const dadosComparativos = [];
    
    for (let i = 11; i >= 0; i--) {
      const data = new Date(anoSelecionado, mesSelecionado - i, 1);
      const mes = data.getMonth();
      const ano = data.getFullYear();
      
      const dadosMes = dadosHistoricos.filter(d => d.mes === mes && d.ano === ano);
      const dadosAnoAnterior = dadosHistoricos.filter(d => d.mes === mes && d.ano === ano - 1);
      
      const metricas = calcularMetricas(dadosMes);
      const metricasAnoAnterior = calcularMetricas(dadosAnoAnterior);
      
      // Buscar meta do sistema
      const metaEncontrada = obterMetasPropriedade(propertyId, ano).find(meta => 
        meta.mesAno === `${ano}-${String(mes + 1).padStart(2, '0')}` && meta.tipoMeta === 'receita'
      );

      dadosComparativos.push({
        mes: mesesNomes[mes].substring(0, 3),
        mesCompleto: mesesNomes[mes],
        ano,
        receitaAtual: metricas.receita,
        receitaAnoAnterior: metricasAnoAnterior.receita,
        meta: metaEncontrada ? metaEncontrada.valorMeta : metricas.receita * 1.1,
        ocupacaoAtual: metricas.ocupacao,
        ocupacaoAnoAnterior: metricasAnoAnterior.ocupacao,
        adrAtual: metricas.adr,
        adrAnoAnterior: metricasAnoAnterior.adr
      });
    }
    
    setDadosComparativos(dadosComparativos);
  };

  useEffect(() => {
    if (propertyId) {
      processarDadosHistoricos();
    }
  }, [propertyId]);

  useEffect(() => {
    if (dadosHistoricos.length > 0) {
      calcularKPIsMes();
      gerarDadosComparativos();
    }
  }, [dadosHistoricos, mesSelecionado, anoSelecionado]);

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const calcularVariacao = (atual: number, anterior: number) => {
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return ((atual - anterior) / anterior) * 100;
  };

  const obterCorVariacao = (variacao: number) => {
    if (variacao > 0) return 'text-green-400';
    if (variacao < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const navegar = (direcao: 'anterior' | 'proximo') => {
    if (direcao === 'anterior') {
      if (mesSelecionado === 0) {
        setMesSelecionado(11);
        setAnoSelecionado(anoSelecionado - 1);
      } else {
        setMesSelecionado(mesSelecionado - 1);
      }
    } else {
      if (mesSelecionado === 11) {
        setMesSelecionado(0);
        setAnoSelecionado(anoSelecionado + 1);
      } else {
        setMesSelecionado(mesSelecionado + 1);
      }
    }
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
      {/* Header com Seletor de Período */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{currentProperty.name}</h2>
              <p className="text-slate-400">{currentProperty.location} • {currentProperty.rooms} quartos</p>
              {estatisticasUpload.totalRegistros > 0 && (
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-green-400">
                    📊 {estatisticasUpload.totalRegistros} registros
                  </span>
                  <span className="text-blue-400">
                    📅 Período: {estatisticasUpload.periodoCobertura}
                  </span>
                </div>
              )}
            </div>
            
            {/* Seletor de Mês/Ano */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navegar('anterior')}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {mesesNomes[mesSelecionado]} {anoSelecionado}
                </p>
                <p className="text-sm text-slate-400">Período de Análise</p>
              </div>
              
              <button
                onClick={() => navegar('proximo')}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Comparativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Receita */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold text-white">{formatarValor(kpiData.mesAtual.receita)}</div>
              <div className="text-xs text-slate-400">
                Ano anterior: {formatarValor(kpiData.anoAnterior.receita)}
              </div>
              <div className={`text-xs font-medium ${obterCorVariacao(calcularVariacao(kpiData.mesAtual.receita, kpiData.anoAnterior.receita))}`}>
                {calcularVariacao(kpiData.mesAtual.receita, kpiData.anoAnterior.receita) > 0 ? '↗' : '↘'} 
                {Math.abs(calcularVariacao(kpiData.mesAtual.receita, kpiData.anoAnterior.receita)).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ocupação */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              Ocupação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold text-white">{kpiData.mesAtual.ocupacao.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">
                Ano anterior: {kpiData.anoAnterior.ocupacao.toFixed(1)}%
              </div>
              <div className={`text-xs font-medium ${obterCorVariacao(calcularVariacao(kpiData.mesAtual.ocupacao, kpiData.anoAnterior.ocupacao))}`}>
                {calcularVariacao(kpiData.mesAtual.ocupacao, kpiData.anoAnterior.ocupacao) > 0 ? '↗' : '↘'} 
                {Math.abs(calcularVariacao(kpiData.mesAtual.ocupacao, kpiData.anoAnterior.ocupacao)).toFixed(1)}pp
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ADR */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              ADR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold text-white">{formatarValor(kpiData.mesAtual.adr)}</div>
              <div className="text-xs text-slate-400">
                Ano anterior: {formatarValor(kpiData.anoAnterior.adr)}
              </div>
              <div className={`text-xs font-medium ${obterCorVariacao(calcularVariacao(kpiData.mesAtual.adr, kpiData.anoAnterior.adr))}`}>
                {calcularVariacao(kpiData.mesAtual.adr, kpiData.anoAnterior.adr) > 0 ? '↗' : '↘'} 
                {Math.abs(calcularVariacao(kpiData.mesAtual.adr, kpiData.anoAnterior.adr)).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RevPAR */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-400" />
              RevPAR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold text-white">{formatarValor(kpiData.mesAtual.revpar)}</div>
              <div className="text-xs text-slate-400">
                Ano anterior: {formatarValor(kpiData.anoAnterior.revpar)}
              </div>
              <div className={`text-xs font-medium ${obterCorVariacao(calcularVariacao(kpiData.mesAtual.revpar, kpiData.anoAnterior.revpar))}`}>
                {calcularVariacao(kpiData.mesAtual.revpar, kpiData.anoAnterior.revpar) > 0 ? '↗' : '↘'} 
                {Math.abs(calcularVariacao(kpiData.mesAtual.revpar, kpiData.anoAnterior.revpar)).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reservas */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-400" />
              Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold text-white">{kpiData.mesAtual.reservas}</div>
              <div className="text-xs text-slate-400">
                Ano anterior: {kpiData.anoAnterior.reservas}
              </div>
              <div className={`text-xs font-medium ${obterCorVariacao(calcularVariacao(kpiData.mesAtual.reservas, kpiData.anoAnterior.reservas))}`}>
                {calcularVariacao(kpiData.mesAtual.reservas, kpiData.anoAnterior.reservas) > 0 ? '↗' : '↘'} 
                {Math.abs(calcularVariacao(kpiData.mesAtual.reservas, kpiData.anoAnterior.reservas)).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previsão */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Activity className="h-4 w-4 text-yellow-400" />
              Previsão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-bold text-yellow-400">{formatarValor(kpiData.previsao.receita)}</div>
              <div className="text-xs text-slate-400">
                ML Forecast
              </div>
              <div className="text-xs text-yellow-400 font-medium">
                {kpiData.previsao.ocupacao.toFixed(1)}% ocupação
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Comparativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita - Últimos 12 Meses */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Receita - Últimos 12 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dadosComparativos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [formatarValor(value), name]}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="receitaAtual" fill="#10b981" name="Atual" opacity={0.8} />
                <Bar dataKey="receitaAnoAnterior" fill="#6b7280" name="Ano Anterior" opacity={0.6} />
                <Line type="monotone" dataKey="meta" stroke="#ef4444" strokeWidth={2} name="Meta" strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ocupação - Últimos 12 Meses */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Ocupação - Últimos 12 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosComparativos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="ocupacaoAtual" stroke="#3b82f6" strokeWidth={3} name="Ocupação Atual" />
                <Line type="monotone" dataKey="ocupacaoAnoAnterior" stroke="#9ca3af" strokeWidth={2} name="Ano Anterior" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Análise Comparativa - {mesesNomes[mesSelecionado]} {anoSelecionado}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mês Atual */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
                {mesesNomes[mesSelecionado]} {anoSelecionado}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Receita:</span>
                  <span className="text-white font-medium">{formatarValor(kpiData.mesAtual.receita)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reservas:</span>
                  <span className="text-white font-medium">{kpiData.mesAtual.reservas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ocupação:</span>
                  <span className="text-white font-medium">{kpiData.mesAtual.ocupacao.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ADR:</span>
                  <span className="text-white font-medium">{formatarValor(kpiData.mesAtual.adr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RevPAR:</span>
                  <span className="text-white font-medium">{formatarValor(kpiData.mesAtual.revpar)}</span>
                </div>
              </div>
            </div>

            {/* Ano Anterior */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-400 border-b border-slate-600 pb-2">
                {mesesNomes[mesSelecionado]} {anoSelecionado - 1}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Receita:</span>
                  <span className="text-slate-300">{formatarValor(kpiData.anoAnterior.receita)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reservas:</span>
                  <span className="text-slate-300">{kpiData.anoAnterior.reservas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ocupação:</span>
                  <span className="text-slate-300">{kpiData.anoAnterior.ocupacao.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ADR:</span>
                  <span className="text-slate-300">{formatarValor(kpiData.anoAnterior.adr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RevPAR:</span>
                  <span className="text-slate-300">{formatarValor(kpiData.anoAnterior.revpar)}</span>
                </div>
              </div>
            </div>

            {/* Previsão */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-yellow-400 border-b border-slate-600 pb-2">
                Previsão ML
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Receita:</span>
                  <span className="text-yellow-400 font-medium">{formatarValor(kpiData.previsao.receita)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reservas:</span>
                  <span className="text-yellow-400 font-medium">{Math.round(kpiData.previsao.reservas)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ocupação:</span>
                  <span className="text-yellow-400 font-medium">{kpiData.previsao.ocupacao.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ADR:</span>
                  <span className="text-yellow-400 font-medium">{formatarValor(kpiData.previsao.adr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RevPAR:</span>
                  <span className="text-yellow-400 font-medium">{formatarValor(kpiData.previsao.revpar)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {dadosHistoricos.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Dados Processados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-green-400">✅ {dadosHistoricos.length} registros processados</p>
              <p className="text-blue-400">📅 Cobertura: {estatisticasUpload.periodoCobertura}</p>
              <p className="text-purple-400">🎯 Analisando: {mesesNomes[mesSelecionado]} {anoSelecionado}</p>
              <p className="text-orange-400">📊 Formatos suportados: bookingInternalID, checkInDateTime, data_checkin</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ForecastDashboard;
