import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Award, AlertTriangle, Building2, ArrowLeft } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProperties } from '@/hooks/useProperties';
import { useReservationData } from '@/hooks/useReservationData';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ResizableLayout } from '@/components/layout/ResizableLayout';
import { WidgetGrid, Widget } from '@/components/widgets/WidgetGrid';
import AlertsPanel from '@/components/forecast/AlertsPanel';

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Consolidar dados de todas as propriedades
  const consolidatedData = properties.map(property => {
    const { data: reservations } = useReservationData(property.id);
    
    // Calcular métricas para cada propriedade
    const totalRevenue = reservations.reduce((sum, r) => sum + r.valor_total, 0);
    const totalBookings = reservations.length;
    const avgADR = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    const currentOccupancy = property.occupancy || 0;
    const revpar = (avgADR * currentOccupancy) / 100;

    return {
      id: property.id,
      name: property.name,
      location: property.location,
      rooms: property.rooms,
      revenue: totalRevenue,
      bookings: totalBookings,
      adr: avgADR,
      occupancy: currentOccupancy,
      revpar: revpar,
      reservations: reservations
    };
  });

  // Ranking de performance
  const sortedByRevenue = [...consolidatedData].sort((a, b) => b.revenue - a.revenue);
  const sortedByOccupancy = [...consolidatedData].sort((a, b) => b.occupancy - a.occupancy);
  const sortedByRevPAR = [...consolidatedData].sort((a, b) => b.revpar - a.revpar);

  // Métricas totais
  const totalRevenue = consolidatedData.reduce((sum, p) => sum + p.revenue, 0);
  const totalRooms = consolidatedData.reduce((sum, p) => sum + p.rooms, 0);
  const avgOccupancy = consolidatedData.reduce((sum, p) => sum + p.occupancy, 0) / consolidatedData.length;
  const avgADR = consolidatedData.reduce((sum, p) => sum + p.adr, 0) / consolidatedData.length;

  // Dados para gráficos comparativos
  const comparisonData = consolidatedData.map(p => ({
    name: p.name.substring(0, 15),
    revenue: p.revenue,
    occupancy: p.occupancy,
    adr: p.adr,
    revpar: p.revpar
  }));

  // Widgets para o dashboard reorganizável
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'revenue-chart',
      title: 'Receita por Propriedade',
      order: 0,
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
            <Tooltip 
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
            />
            <Bar dataKey="revenue" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'occupancy-chart',
      title: 'Ocupação por Propriedade',
      order: 1,
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value}%`} />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Ocupação']}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
            />
            <Bar dataKey="occupancy" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'ranking-revenue',
      title: 'Ranking por Receita',
      order: 2,
      component: (
        <div className="space-y-3">
          {sortedByRevenue.slice(0, 5).map((property, index) => (
            <div key={property.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={`${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                                 index === 1 ? 'bg-gray-500/20 text-gray-400' :
                                 index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                 'bg-slate-500/20 text-slate-400'}`}>
                  {index + 1}°
                </Badge>
                <span className="text-white font-medium text-sm">{property.name}</span>
              </div>
              <span className="text-green-400 font-bold text-sm">
                R$ {property.revenue.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      )
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumbs />
        
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
              <Building2 className="w-8 h-8 text-blue-400" />
              Dashboard Executivo
            </h1>
            <p className="text-xl text-slate-300">
              Visão consolidada de todas as propriedades
            </p>
          </div>
        </div>

        {/* KPIs Consolidados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Receita Total</p>
                  <p className="text-2xl font-bold text-white">
                    R$ {totalRevenue.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Ocupação Média</p>
                  <p className="text-2xl font-bold text-white">
                    {avgOccupancy.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">ADR Médio</p>
                  <p className="text-2xl font-bold text-white">
                    R$ {avgADR.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Quartos</p>
                  <p className="text-2xl font-bold text-white">
                    {totalRooms}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layout Redimensionável com Widgets */}
        <ResizableLayout
          leftPanel={
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Filtros e Controles</h3>
              <div className="space-y-2">
                <select 
                  className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="week">Última Semana</option>
                  <option value="month">Último Mês</option>
                  <option value="quarter">Último Trimestre</option>
                  <option value="year">Último Ano</option>
                </select>
              </div>
            </div>
          }
        >
          <WidgetGrid
            widgets={widgets}
            onReorder={setWidgets}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          />
        </ResizableLayout>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
