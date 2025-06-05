
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProperties } from '@/hooks/useProperties';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Target, Lightbulb, ArrowUpRight } from 'lucide-react';

const RevenueOpportunities = () => {
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState('all');

  // Generate opportunity analysis
  const getOpportunities = () => {
    const opportunities = [];

    properties.forEach(property => {
      const currentRevPAR = property.revpar || 180;
      const currentOccupancy = property.occupancy || 75;
      const currentADR = property.adr || 240;

      // Price optimization opportunity
      const marketADR = 260; // Benchmark
      const adrGap = marketADR - currentADR;
      if (adrGap > 10) {
        const potentialRevenue = adrGap * currentOccupancy * 0.01 * property.rooms * 30; // Monthly
        opportunities.push({
          id: `adr_${property.id}`,
          propertyId: property.id,
          propertyName: property.name,
          type: 'Otimização de Preços',
          description: `Ajustar ADR para benchmark de mercado (R$ ${marketADR})`,
          currentValue: currentADR,
          targetValue: marketADR,
          potentialRevenue: potentialRevenue,
          implementationDifficulty: 'Baixa',
          timeline: '1-2 semanas',
          priority: potentialRevenue > 50000 ? 'Alta' : 'Média',
          impact: adrGap / currentADR * 100,
          category: 'pricing'
        });
      }

      // Occupancy optimization
      const marketOccupancy = 85;
      const occupancyGap = marketOccupancy - currentOccupancy;
      if (occupancyGap > 5) {
        const potentialRevenue = occupancyGap * 0.01 * currentADR * property.rooms * 30;
        opportunities.push({
          id: `occ_${property.id}`,
          propertyId: property.id,
          propertyName: property.name,
          type: 'Aumento de Ocupação',
          description: `Campanhas de marketing para atingir ${marketOccupancy}% de ocupação`,
          currentValue: currentOccupancy,
          targetValue: marketOccupancy,
          potentialRevenue: potentialRevenue,
          implementationDifficulty: 'Média',
          timeline: '1-3 meses',
          priority: potentialRevenue > 30000 ? 'Alta' : 'Média',
          impact: occupancyGap / currentOccupancy * 100,
          category: 'marketing'
        });
      }

      // Channel optimization
      const directBookingPotential = property.rooms * currentADR * 0.15 * 30; // 15% commission savings
      opportunities.push({
        id: `channel_${property.id}`,
        propertyId: property.id,
        propertyName: property.name,
        type: 'Otimização de Canais',
        description: 'Aumentar reservas diretas em 20% para reduzir comissões',
        currentValue: 45, // % direct bookings
        targetValue: 65,
        potentialRevenue: directBookingPotential,
        implementationDifficulty: 'Média',
        timeline: '2-4 meses',
        priority: 'Média',
        impact: 15,
        category: 'channels'
      });

      // Upselling opportunities
      if (property.category === 'Luxo' || property.category === 'Resort') {
        const upsellRevenue = property.rooms * 50 * 0.3 * 30; // R$ 50 average upsell, 30% conversion
        opportunities.push({
          id: `upsell_${property.id}`,
          propertyId: property.id,
          propertyName: property.name,
          type: 'Estratégia de Upselling',
          description: 'Implementar programa de upgrades e serviços adicionais',
          currentValue: 0,
          targetValue: 50,
          potentialRevenue: upsellRevenue,
          implementationDifficulty: 'Alta',
          timeline: '3-6 meses',
          priority: 'Média',
          impact: upsellRevenue / (currentRevPAR * property.rooms * 30) * 100,
          category: 'services'
        });
      }
    });

    return opportunities.sort((a, b) => b.potentialRevenue - a.potentialRevenue);
  };

  const opportunities = getOpportunities();

  // Filter opportunities by property
  const filteredOpportunities = selectedProperty === 'all' 
    ? opportunities 
    : opportunities.filter(opp => opp.propertyId === selectedProperty);

  // Aggregate data for charts
  const getCategoryData = () => {
    const categories = ['pricing', 'marketing', 'channels', 'services'];
    return categories.map(category => {
      const categoryOpps = filteredOpportunities.filter(opp => opp.category === category);
      const totalRevenue = categoryOpps.reduce((sum, opp) => sum + opp.potentialRevenue, 0);
      return {
        name: category === 'pricing' ? 'Preços' :
              category === 'marketing' ? 'Marketing' :
              category === 'channels' ? 'Canais' : 'Serviços',
        value: totalRevenue,
        count: categoryOpps.length
      };
    });
  };

  const categoryData = getCategoryData();

  // Priority analysis
  const getPriorityData = () => {
    const priorities = ['Alta', 'Média', 'Baixa'];
    return priorities.map(priority => {
      const priorityOpps = filteredOpportunities.filter(opp => opp.priority === priority);
      const totalRevenue = priorityOpps.reduce((sum, opp) => sum + opp.potentialRevenue, 0);
      return {
        name: priority,
        value: totalRevenue,
        count: priorityOpps.length
      };
    });
  };

  const priorityData = getPriorityData();

  // Implementation roadmap
  const getRoadmap = () => {
    const timeframes = ['1-2 semanas', '1-3 meses', '2-4 meses', '3-6 meses'];
    return timeframes.map(timeframe => {
      const timeframeOpps = filteredOpportunities.filter(opp => opp.timeline === timeframe);
      const totalRevenue = timeframeOpps.reduce((sum, opp) => sum + opp.potentialRevenue, 0);
      return {
        timeframe,
        revenue: totalRevenue,
        opportunities: timeframeOpps.length
      };
    });
  };

  const roadmapData = getRoadmap();

  const totalPotentialRevenue = filteredOpportunities.reduce((sum, opp) => sum + opp.potentialRevenue, 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-500';
      case 'Média': return 'bg-yellow-500';
      case 'Baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Baixa': return 'text-green-400';
      case 'Média': return 'text-yellow-400';
      case 'Alta': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Potencial Total</p>
                <p className="text-lg font-bold text-white">R$ {(totalPotentialRevenue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Oportunidades</p>
                <p className="text-lg font-bold text-white">{filteredOpportunities.length}</p>
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
                <p className="text-xs text-slate-400">Alta Prioridade</p>
                <p className="text-lg font-bold text-white">
                  {filteredOpportunities.filter(opp => opp.priority === 'Alta').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Lightbulb className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">ROI Médio</p>
                <p className="text-lg font-bold text-white">
                  {filteredOpportunities.length > 0 ? 
                    (filteredOpportunities.reduce((sum, opp) => sum + opp.impact, 0) / filteredOpportunities.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Filter */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-white font-medium">Filtrar por propriedade:</label>
            <div className="flex gap-2">
              <Button
                variant={selectedProperty === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedProperty('all')}
                className="border-slate-600"
              >
                Todas
              </Button>
              {properties.map(property => (
                <Button
                  key={property.id}
                  variant={selectedProperty === property.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedProperty(property.id)}
                  className="border-slate-600"
                >
                  {property.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Oportunidades por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: R$ ${(value/1000).toFixed(0)}k`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                  formatter={(value: number) => [`R$ ${(value/1000).toFixed(0)}k`, 'Potencial']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Roadmap de Implementação</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roadmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="timeframe" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                  formatter={(value: number) => [`R$ ${(value/1000).toFixed(0)}k`, 'Potencial']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities List */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Lista de Oportunidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="p-4 border border-slate-600 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium">{opportunity.type}</h3>
                      <Badge className={`text-xs ${getPriorityColor(opportunity.priority)}`}>
                        {opportunity.priority}
                      </Badge>
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        {opportunity.propertyName}
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">{opportunity.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Potencial de Receita</p>
                        <p className="text-green-400 font-medium">
                          R$ {(opportunity.potentialRevenue / 1000).toFixed(0)}k/mês
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Impacto</p>
                        <p className="text-blue-400 font-medium">+{opportunity.impact.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Dificuldade</p>
                        <p className={`font-medium ${getDifficultyColor(opportunity.implementationDifficulty)}`}>
                          {opportunity.implementationDifficulty}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Timeline</p>
                        <p className="text-white font-medium">{opportunity.timeline}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 ml-4">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    Implementar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueOpportunities;
