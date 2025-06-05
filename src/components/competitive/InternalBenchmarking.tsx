import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useProperties } from '@/hooks/useProperties';
import { useReservationData } from '@/hooks/useReservationData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, Trophy, TrendingUp, Users } from 'lucide-react';

interface PropertyData {
  id: string;
  name: string;
  category: string;
  location: string;
  rooms: number;
  revpar: number;
  occupancy: number;
  adr: number;
  totalRevenue: number;
  customerSatisfaction: number;
  averageStay: number;
  repeatCustomers: number;
}

const InternalBenchmarking = () => {
  const { properties } = useProperties();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('revpar');

  // Get data for all properties
  const getAllPropertiesData = (): PropertyData[] => {
    return properties.map(property => {
      // Simulate realistic data based on property characteristics
      const baseRevPAR = property.revpar || 150 + (property.rooms || 100) * 0.5;
      const baseOccupancy = property.occupancy || 70 + Math.random() * 15;
      const baseADR = property.adr || 200 + (property.rooms || 100) * 0.8;
      const rooms = property.rooms || 100;
      
      return {
        id: property.id,
        name: property.name,
        category: property.category || 'Hotel',
        location: property.location,
        rooms: rooms,
        revpar: baseRevPAR,
        occupancy: baseOccupancy,
        adr: baseADR,
        totalRevenue: baseRevPAR * parseInt(selectedPeriod) * rooms,
        customerSatisfaction: 4.1 + Math.random() * 0.8,
        averageStay: 2.1 + Math.random() * 1.5,
        repeatCustomers: 25 + Math.random() * 35
      };
    });
  };

  const propertiesData = getAllPropertiesData();

  // Calculate rankings
  const getRankings = () => {
    const metrics = ['revpar', 'occupancy', 'adr', 'totalRevenue', 'customerSatisfaction'] as const;
    const rankings: Record<string, any[]> = {};
    
    metrics.forEach(metric => {
      rankings[metric] = [...propertiesData]
        .sort((a, b) => (b[metric] as number) - (a[metric] as number))
        .map((property, index) => ({
          ...property,
          rank: index + 1,
          percentile: ((propertiesData.length - index) / propertiesData.length) * 100
        }));
    });
    
    return rankings;
  };

  const rankings = getRankings();

  // Performance comparison chart data
  const getComparisonData = () => {
    return propertiesData.map(property => ({
      name: property.name,
      RevPAR: property.revpar,
      'Ocupação (%)': property.occupancy,
      ADR: property.adr,
      'Satisfação': property.customerSatisfaction * 20, // Scale for visibility
      'Receita Total (k)': property.totalRevenue / 1000
    }));
  };

  const comparisonData = getComparisonData();

  // Trend analysis (simulated monthly data)
  const getTrendData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map(month => {
      const data: any = { month };
      propertiesData.forEach(property => {
        // Simulate monthly variation
        const variation = 0.9 + Math.random() * 0.2;
        const metricValue = property[selectedMetric as keyof PropertyData] as number;
        data[property.name] = metricValue * variation;
      });
      return data;
    });
  };

  const trendData = getTrendData();

  // Best practices identification
  const getBestPractices = () => {
    const practices = [];
    
    // Highest RevPAR
    const topRevPAR = rankings.revpar[0];
    practices.push({
      category: 'Gestão de Receita',
      leader: topRevPAR.name,
      metric: 'RevPAR',
      value: topRevPAR.revpar.toFixed(2),
      insight: 'Estratégia de pricing dinâmico mais eficaz'
    });

    // Highest Occupancy
    const topOccupancy = rankings.occupancy[0];
    practices.push({
      category: 'Marketing & Vendas',
      leader: topOccupancy.name,
      metric: 'Ocupação',
      value: `${topOccupancy.occupancy.toFixed(1)}%`,
      insight: 'Melhor gestão de canais de distribuição'
    });

    // Highest Customer Satisfaction
    const topSatisfaction = rankings.customerSatisfaction[0];
    practices.push({
      category: 'Experiência do Cliente',
      leader: topSatisfaction.name,
      metric: 'Satisfação',
      value: topSatisfaction.customerSatisfaction.toFixed(1),
      insight: 'Excelência operacional e atendimento'
    });

    return practices;
  };

  const bestPractices = getBestPractices();

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-slate-300';
      case 3: return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Benchmarking Interno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Métrica para Tendência</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revpar">RevPAR</SelectItem>
                  <SelectItem value="occupancy">Ocupação</SelectItem>
                  <SelectItem value="adr">ADR</SelectItem>
                  <SelectItem value="totalRevenue">Receita Total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Ranking RevPAR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.revpar.slice(0, 4).map((property) => (
                <div key={property.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getRankColor(property.rank)}`}>
                      {getRankIcon(property.rank)}
                    </span>
                    <span className="text-white text-sm">{property.name}</span>
                  </div>
                  <span className="text-slate-300 text-sm">R$ {property.revpar.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Ranking Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.occupancy.slice(0, 4).map((property) => (
                <div key={property.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getRankColor(property.rank)}`}>
                      {getRankIcon(property.rank)}
                    </span>
                    <span className="text-white text-sm">{property.name}</span>
                  </div>
                  <span className="text-slate-300 text-sm">{property.occupancy.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Ranking ADR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.adr.slice(0, 4).map((property) => (
                <div key={property.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getRankColor(property.rank)}`}>
                      {getRankIcon(property.rank)}
                    </span>
                    <span className="text-white text-sm">{property.name}</span>
                  </div>
                  <span className="text-slate-300 text-sm">R$ {property.adr.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison Chart */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Comparação de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }} 
              />
              <Bar dataKey="RevPAR" fill="#3b82f6" name="RevPAR" />
              <Bar dataKey="ADR" fill="#10b981" name="ADR" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Análise de Tendências - {selectedMetric.toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }} 
              />
              {properties.map((property, index) => (
                <Line
                  key={property.id}
                  type="monotone"
                  dataKey={property.name}
                  stroke={`hsl(${index * 90}, 70%, 50%)`}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Melhores Práticas Identificadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestPractices.map((practice, index) => (
              <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium text-white">{practice.category}</span>
                </div>
                <p className="text-sm text-slate-300 mb-2">Líder: <strong>{practice.leader}</strong></p>
                <p className="text-lg font-bold text-white mb-1">
                  {practice.metric}: {practice.value}
                </p>
                <p className="text-xs text-slate-400">{practice.insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternalBenchmarking;
