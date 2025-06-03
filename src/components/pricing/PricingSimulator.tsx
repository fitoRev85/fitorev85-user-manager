
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { useReservationData } from '@/hooks/useReservationData';
import { Property } from '@/hooks/useProperties';

interface PricingSimulatorProps {
  propertyId: string;
  property: Property;
}

interface Scenario {
  name: string;
  priceAdjustment: number;
  projectedOccupancy: number;
  projectedRevenue: number;
  projectedADR: number;
}

const PricingSimulator = ({ propertyId, property }: PricingSimulatorProps) => {
  const { data: reservas } = useReservationData(propertyId);
  const [basePrice, setBasePrice] = useState(property.adr || 250);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const currentMetrics = useMemo(() => {
    if (reservas.length === 0) return { occupancy: 0, revenue: 0, adr: 0 };

    const totalRevenue = reservas.reduce((sum, r) => sum + (r.valor_total || 0), 0);
    const totalNights = reservas.reduce((sum, r) => sum + (r.noites || 1), 0);
    const uniqueDates = new Set(reservas.map(r => r.data_checkin?.split('T')[0])).size;
    
    return {
      occupancy: (reservas.length / (property.rooms * 30)) * 100, // Estimativa mensal
      revenue: totalRevenue,
      adr: totalNights > 0 ? totalRevenue / totalNights : 0
    };
  }, [reservas, property.rooms]);

  const generateScenarios = () => {
    const adjustments = [-20, -10, -5, 0, 5, 10, 20];
    const newScenarios: Scenario[] = [];

    adjustments.forEach(adjustment => {
      const newPrice = basePrice * (1 + adjustment / 100);
      
      // Simular impacto na ocupação (elasticidade de demanda)
      let occupancyChange = 0;
      if (adjustment > 0) {
        occupancyChange = -adjustment * 0.8; // Aumento de preço reduz ocupação
      } else {
        occupancyChange = Math.abs(adjustment) * 1.2; // Redução de preço aumenta ocupação
      }
      
      const projectedOccupancy = Math.max(0, Math.min(100, currentMetrics.occupancy + occupancyChange));
      const projectedRooms = (projectedOccupancy / 100) * property.rooms * 30;
      const projectedRevenue = projectedRooms * newPrice;
      
      newScenarios.push({
        name: adjustment === 0 ? 'Atual' : `${adjustment > 0 ? '+' : ''}${adjustment}%`,
        priceAdjustment: adjustment,
        projectedOccupancy,
        projectedRevenue,
        projectedADR: newPrice
      });
    });

    setScenarios(newScenarios);
  };

  const bestScenario = scenarios.length > 0 
    ? scenarios.reduce((best, scenario) => 
        scenario.projectedRevenue > best.projectedRevenue ? scenario : best
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Configuração da Simulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Preço Base Atual (R$)</Label>
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            
            <Button 
              onClick={generateScenarios}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Gerar Cenários
            </Button>
          </CardContent>
        </Card>

        {/* Métricas Atuais */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Métricas Atuais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Ocupação</p>
                <p className="text-lg font-bold text-white">
                  {currentMetrics.occupancy.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">ADR</p>
                <p className="text-lg font-bold text-white">
                  R$ {currentMetrics.adr.toFixed(0)}
                </p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Receita</p>
                <p className="text-lg font-bold text-white">
                  R$ {(currentMetrics.revenue / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Cenários */}
      {scenarios.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Simulação de Cenários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#9CA3AF' }}
                    tickLine={{ stroke: '#6B7280' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9CA3AF' }}
                    tickLine={{ stroke: '#6B7280' }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'projectedRevenue' 
                        ? `R$ ${value.toLocaleString('pt-BR')}` 
                        : value,
                      name === 'projectedRevenue' ? 'Receita Projetada' : name
                    ]}
                  />
                  <Bar 
                    dataKey="projectedRevenue" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Cenários */}
      {scenarios.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Detalhes dos Cenários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Cenário</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">ADR</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">Ocupação</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">Receita</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">vs Atual</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario, index) => {
                    const isCurrentPrice = scenario.priceAdjustment === 0;
                    const isBest = bestScenario && scenario.name === bestScenario.name;
                    const revenueChange = isCurrentPrice ? 0 : 
                      ((scenario.projectedRevenue - currentMetrics.revenue) / currentMetrics.revenue) * 100;
                    
                    return (
                      <tr 
                        key={index} 
                        className={`border-b border-slate-700/50 ${
                          isBest ? 'bg-green-500/10' : isCurrentPrice ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{scenario.name}</span>
                            {isBest && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Melhor</span>}
                            {isCurrentPrice && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Atual</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          R$ {scenario.projectedADR.toFixed(0)}
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          {scenario.projectedOccupancy.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          R$ {scenario.projectedRevenue.toLocaleString('pt-BR')}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${
                          revenueChange > 0 ? 'text-green-400' : 
                          revenueChange < 0 ? 'text-red-400' : 'text-slate-400'
                        }`}>
                          {isCurrentPrice ? '-' : 
                           `${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(1)}%`
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendação */}
      {bestScenario && bestScenario.priceAdjustment !== 0 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Recomendação</h3>
                <p className="text-slate-300">
                  Ajustar o preço em <strong>{bestScenario.name}</strong> pode aumentar a receita em{' '}
                  <strong className="text-green-400">
                    R$ {(bestScenario.projectedRevenue - currentMetrics.revenue).toLocaleString('pt-BR')}
                  </strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PricingSimulator;
