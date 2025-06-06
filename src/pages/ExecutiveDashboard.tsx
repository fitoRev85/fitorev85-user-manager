import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Users, Target, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';
import { useReservationData } from '@/hooks/useReservationData';
import ChannelAnalytics from '@/components/dashboard/ChannelAnalytics';
import PerformanceComparison from '@/components/dashboard/PerformanceComparison';

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  
  // Para demonstração, usar dados da primeira propriedade se houver
  const propertyId = selectedProperty === 'all' ? (properties[0]?.id || '1') : selectedProperty;
  const { data: reservations } = useReservationData(propertyId);

  // Calcular métricas gerais
  const metrics = React.useMemo(() => {
    if (reservations.length === 0) {
      return {
        totalReservas: 0,
        receitaTotal: 0,
        adrMedio: 0,
        ocupacaoMedia: 0
      };
    }

    const receitaTotal = reservations.reduce((sum, r) => sum + (r.valor_total || 0), 0);
    const totalNoites = reservations.reduce((sum, r) => sum + (r.noites || 1), 0);
    const adrMedio = totalNoites > 0 ? receitaTotal / totalNoites : 0;

    return {
      totalReservas: reservations.length,
      receitaTotal,
      adrMedio,
      ocupacaoMedia: Math.min(85 + Math.random() * 15, 100) // Simulado
    };
  }, [reservations]);

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
            <h1 className="text-4xl font-bold text-white">
              Dashboard Executivo
            </h1>
            <p className="text-xl text-slate-300">
              Visão geral da performance e análises estratégicas
            </p>
          </div>
        </div>

        {/* Seletor de propriedade */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-400">Propriedade:</label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-white">Todas as Propriedades</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id} className="text-white">
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Reservas</p>
                  <p className="text-white text-2xl font-bold">{metrics.totalReservas}</p>
                  <p className="text-green-400 text-xs">+12% vs período anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Receita Total</p>
                  <p className="text-white text-2xl font-bold">
                    R$ {metrics.receitaTotal.toLocaleString()}
                  </p>
                  <p className="text-green-400 text-xs">+8% vs período anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">ADR Médio</p>
                  <p className="text-white text-2xl font-bold">
                    R$ {metrics.adrMedio.toFixed(0)}
                  </p>
                  <p className="text-green-400 text-xs">+5% vs período anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <Target className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Ocupação</p>
                  <p className="text-white text-2xl font-bold">
                    {metrics.ocupacaoMedia.toFixed(1)}%
                  </p>
                  <p className="text-green-400 text-xs">+3% vs período anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance vs Período Anterior */}
        <PerformanceComparison propertyId={propertyId} />

        {/* Abas de análise */}
        <Tabs defaultValue="channels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger 
              value="channels" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <PieChart className="w-4 h-4" />
              Análise de Canais
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="forecast" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Forecast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="channels">
            <ChannelAnalytics propertyId={selectedProperty} />
          </TabsContent>

          <TabsContent value="performance">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">Análise de Performance</h3>
                <p className="text-slate-400">Em desenvolvimento - métricas avançadas de performance</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">Previsões e Tendências</h3>
                <p className="text-slate-400">Em desenvolvimento - análises preditivas e forecasting</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
