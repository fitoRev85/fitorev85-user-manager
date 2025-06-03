
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Award, AlertTriangle, Building2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProperties } from '@/hooks/useProperties';
import { useReservationData } from '@/hooks/useReservationData';
import AlertsPanel from '@/components/forecast/AlertsPanel';

const ExecutiveDashboard = () => {
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

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Building2 className="w-8 h-8 text-blue-400" />
            Dashboard Executivo
          </h1>
          <p className="text-xl text-slate-300">
            Visão consolidada de todas as propriedades
          </p>
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

        {/* Conteúdo Principal */}
        <Tabs defaultValue="comparison" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="comparison" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              Comparação
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              Ranking
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              Alertas
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              Detalhes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-6">
            {/* Gráficos Comparativos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Receita por Propriedade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
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
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Ocupação por Propriedade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
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
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">ADR por Propriedade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${value}`} />
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'ADR']}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      />
                      <Bar dataKey="adr" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">RevPAR por Propriedade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${value}`} />
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'RevPAR']}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      />
                      <Bar dataKey="revpar" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ranking por Receita */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Ranking por Receita
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sortedByRevenue.map((property, index) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={`${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                                           index === 1 ? 'bg-gray-500/20 text-gray-400' :
                                           index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                           'bg-slate-500/20 text-slate-400'}`}>
                          {index + 1}°
                        </Badge>
                        <span className="text-white font-medium">{property.name}</span>
                      </div>
                      <span className="text-green-400 font-bold">
                        R$ {property.revenue.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Ranking por Ocupação */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Ranking por Ocupação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sortedByOccupancy.map((property, index) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={`${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                                           index === 1 ? 'bg-gray-500/20 text-gray-400' :
                                           index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                           'bg-slate-500/20 text-slate-400'}`}>
                          {index + 1}°
                        </Badge>
                        <span className="text-white font-medium">{property.name}</span>
                      </div>
                      <span className="text-blue-400 font-bold">
                        {property.occupancy.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Ranking por RevPAR */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Ranking por RevPAR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sortedByRevPAR.map((property, index) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={`${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                                           index === 1 ? 'bg-gray-500/20 text-gray-400' :
                                           index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                           'bg-slate-500/20 text-slate-400'}`}>
                          {index + 1}°
                        </Badge>
                        <span className="text-white font-medium">{property.name}</span>
                      </div>
                      <span className="text-purple-400 font-bold">
                        R$ {property.revpar.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {properties.map(property => {
                const propertyData = consolidatedData.find(p => p.id === property.id);
                if (!propertyData) return null;

                return (
                  <AlertsPanel
                    key={property.id}
                    propertyId={property.id}
                    currentMetrics={{
                      adr: propertyData.adr,
                      occupancy: propertyData.occupancy,
                      revenue: propertyData.revenue,
                      forecast: propertyData.revpar
                    }}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {consolidatedData.map(property => (
                <Card key={property.id} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">{property.name}</CardTitle>
                    <p className="text-slate-400">{property.location} • {property.rooms} quartos</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <p className="text-slate-400 text-sm">Receita Total</p>
                        <p className="text-white font-bold">R$ {property.revenue.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <p className="text-slate-400 text-sm">Reservas</p>
                        <p className="text-white font-bold">{property.bookings}</p>
                      </div>
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <p className="text-slate-400 text-sm">ADR</p>
                        <p className="text-white font-bold">R$ {property.adr.toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <p className="text-slate-400 text-sm">Ocupação</p>
                        <p className="text-white font-bold">{property.occupancy.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/10 p-3 rounded-lg border-l-4 border-blue-500">
                      <p className="text-blue-400 text-sm font-medium">RevPAR</p>
                      <p className="text-white text-lg font-bold">R$ {property.revpar.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
