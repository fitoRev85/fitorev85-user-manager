
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Calendar, 
  Percent, BarChart3, LineChart, PieChart, RefreshCw,
  AlertTriangle, CheckCircle, Clock, Target
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, 
  Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie
} from 'recharts';

interface ForecastDashboardProps {
  propertyId: string;
}

interface ReservaData {
  id: string;
  data_checkin: string;
  data_checkout: string;
  valor_total: number;
  situacao: string;
  canal?: string;
  hospede_nome?: string;
  tipo_quarto?: string;
  noites?: number;
  diaria_media?: number;
}

const ForecastDashboard = ({ propertyId }: ForecastDashboardProps) => {
  const [reservas, setReservas] = useState<ReservaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadData = () => {
    setLoading(true);
    console.log('Carregando dados para propriedade:', propertyId);

    try {
      // Tentar carregar dados do novo formato (chunks)
      const indexKey = `forecast_data_${propertyId}_index`;
      const indexData = localStorage.getItem(indexKey);
      
      let allData: ReservaData[] = [];

      if (indexData) {
        const index = JSON.parse(indexData);
        console.log('Carregando dados em chunks:', index);
        
        // Carregar todos os chunks
        for (let i = 0; i < index.totalChunks; i++) {
          const chunkKey = `${index.storagePrefix}_chunk_${i}`;
          const chunkData = localStorage.getItem(chunkKey);
          if (chunkData) {
            const chunk = JSON.parse(chunkData);
            allData = [...allData, ...chunk];
          }
        }
        setLastUpdate(index.lastUpdated);
      } else {
        // Fallback para formatos antigos
        const legacyKeys = [
          `reservas_${propertyId}`,
          `forecast_data_${propertyId}`,
          `reservations_data_${propertyId}`
        ];

        for (const key of legacyKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              allData = parsed;
            } else if (parsed.data && Array.isArray(parsed.data)) {
              allData = parsed.data;
            }
            console.log(`Dados carregados de ${key}:`, allData.length, 'registros');
            break;
          }
        }
      }

      console.log('Total de dados carregados:', allData.length);
      console.log('Primeiros 3 registros:', allData.slice(0, 3));

      setReservas(allData);
      if (!lastUpdate && allData.length > 0) {
        setLastUpdate(new Date().toISOString());
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setReservas([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [propertyId]);

  // Calcular métricas
  const metrics = React.useMemo(() => {
    if (reservas.length === 0) {
      return {
        totalReservas: 0,
        receitaTotal: 0,
        adr: 0,
        ocupacao: 0,
        diasForecast: 0
      };
    }

    const reservasConfirmadas = reservas.filter(r => 
      r.situacao && !['cancelada', 'canceled', 'cancelled'].includes(r.situacao.toLowerCase())
    );

    const receitaTotal = reservasConfirmadas.reduce((sum, r) => sum + (r.valor_total || 0), 0);
    const totalNoites = reservasConfirmadas.reduce((sum, r) => sum + (r.noites || 1), 0);
    const adr = totalNoites > 0 ? receitaTotal / totalNoites : 0;

    // Calcular ocupação (assumindo 100 quartos disponíveis por dia)
    const dates = [...new Set(reservasConfirmadas.map(r => r.data_checkin))];
    const quartosOcupados = dates.length;
    const quartosDisponiveis = dates.length * 100; // 100 quartos por dia
    const ocupacao = quartosDisponiveis > 0 ? (quartosOcupados / quartosDisponiveis) * 100 : 0;

    return {
      totalReservas: reservasConfirmadas.length,
      receitaTotal,
      adr,
      ocupacao,
      diasForecast: dates.length
    };
  }, [reservas]);

  // Dados para gráficos
  const chartData = React.useMemo(() => {
    if (reservas.length === 0) return [];

    // Agrupar por data
    const dataMap = new Map();
    
    reservas.forEach(reserva => {
      if (!reserva.data_checkin) return;
      
      const date = reserva.data_checkin.split('T')[0]; // Formato YYYY-MM-DD
      
      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date,
          receita: 0,
          reservas: 0,
          adr: 0
        });
      }
      
      const dayData = dataMap.get(date);
      dayData.receita += reserva.valor_total || 0;
      dayData.reservas += 1;
      dayData.adr = dayData.receita / dayData.reservas;
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [reservas]);

  // Dados por canal
  const canalData = React.useMemo(() => {
    if (reservas.length === 0) return [];

    const canalMap = new Map();
    
    reservas.forEach(reserva => {
      const canal = reserva.canal || 'Direto';
      
      if (!canalMap.has(canal)) {
        canalMap.set(canal, {
          name: canal,
          value: 0,
          count: 0
        });
      }
      
      const data = canalMap.get(canal);
      data.value += reserva.valor_total || 0;
      data.count += 1;
    });

    return Array.from(canalMap.values());
  }, [reservas]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-white">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard de Forecast</h2>
          <p className="text-slate-400">
            Propriedade: {propertyId} • 
            {lastUpdate && ` Última atualização: ${new Date(lastUpdate).toLocaleString('pt-BR')}`}
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Status dos Dados */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {reservas.length > 0 ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  {reservas.length} registros carregados
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  Nenhum dado encontrado - importe dados via módulo de Dados
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Reservas</p>
                <p className="text-white text-xl font-bold">{metrics.totalReservas}</p>
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
                <p className="text-slate-400 text-sm">Receita Total</p>
                <p className="text-white text-xl font-bold">
                  R$ {metrics.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">ADR</p>
                <p className="text-white text-xl font-bold">
                  R$ {metrics.adr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Percent className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Ocupação</p>
                <p className="text-white text-xl font-bold">{metrics.ocupacao.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Período</p>
                <p className="text-white text-xl font-bold">{metrics.diasForecast} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      {reservas.length > 0 && (
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="timeline" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <LineChart className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="canais" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <PieChart className="w-4 h-4 mr-2" />
              Canais
            </TabsTrigger>
            <TabsTrigger value="comparativo" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Comparativo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Receita por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
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
                    <Area 
                      type="monotone" 
                      dataKey="receita" 
                      stroke="#3B82F6" 
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="canais" className="space-y-4">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Distribuição por Canal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={canalData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {canalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparativo" className="space-y-4">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">ADR vs Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={chartData}>
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
                    <Bar dataKey="adr" fill="#8884d8" name="ADR (R$)" />
                    <Bar dataKey="reservas" fill="#82ca9d" name="Reservas" />
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

export default ForecastDashboard;
