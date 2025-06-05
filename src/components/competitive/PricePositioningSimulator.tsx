
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useProperties } from '@/hooks/useProperties';
import { useReservationData } from '@/hooks/useReservationData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { Calculator, Target, TrendingUp, DollarSign } from 'lucide-react';

const PricePositioningSimulator = () => {
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState('1');
  const [simulatedPrice, setSimulatedPrice] = useState([280]);
  const [timeframe, setTimeframe] = useState('30');
  
  const { data: reservations } = useReservationData(selectedProperty);

  // Calculate positioning data
  const getPositioningData = () => {
    const propertyData = properties.map(property => {
      const propertyReservations = property.id === selectedProperty ? 
        reservations : 
        []; // In real scenario, we'd have data for all properties
      
      const avgPrice = property.adr || 250 + Math.random() * 100;
      const occupancy = property.occupancy || 70 + Math.random() * 20;
      const revpar = avgPrice * (occupancy / 100);
      
      return {
        name: property.name,
        price: avgPrice,
        occupancy: occupancy,
        revpar: revpar,
        isSelected: property.id === selectedProperty
      };
    });

    // Add simulated position
    const simulatedOccupancy = calculateSimulatedOccupancy(simulatedPrice[0]);
    propertyData.push({
      name: 'Posição Simulada',
      price: simulatedPrice[0],
      occupancy: simulatedOccupancy,
      revpar: simulatedPrice[0] * (simulatedOccupancy / 100),
      isSelected: false,
      isSimulated: true
    });

    return propertyData;
  };

  const calculateSimulatedOccupancy = (price: number) => {
    // Simple price elasticity model
    const baseOccupancy = 75;
    const priceElasticity = -0.2;
    const avgMarketPrice = 250;
    const priceChange = (price - avgMarketPrice) / avgMarketPrice;
    
    return Math.max(20, Math.min(95, baseOccupancy + (priceElasticity * priceChange * 100)));
  };

  const getImpactAnalysis = () => {
    const currentProperty = properties.find(p => p.id === selectedProperty);
    const currentPrice = currentProperty?.adr || 250;
    const currentOccupancy = currentProperty?.occupancy || 75;
    const currentRevPAR = currentPrice * (currentOccupancy / 100);
    
    const simulatedOccupancy = calculateSimulatedOccupancy(simulatedPrice[0]);
    const simulatedRevPAR = simulatedPrice[0] * (simulatedOccupancy / 100);
    
    const priceChange = ((simulatedPrice[0] - currentPrice) / currentPrice) * 100;
    const occupancyChange = simulatedOccupancy - currentOccupancy;
    const revparChange = ((simulatedRevPAR - currentRevPAR) / currentRevPAR) * 100;
    
    return {
      priceChange,
      occupancyChange,
      revparChange,
      estimatedRevenue: simulatedRevPAR * parseInt(timeframe) * (currentProperty?.rooms || 120)
    };
  };

  const positioningData = getPositioningData();
  const impact = getImpactAnalysis();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Simulador de Posicionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Propriedade</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-white">Período (dias)</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="15">15 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Preço Simulado: R$ {simulatedPrice[0]}</Label>
              <Slider
                value={simulatedPrice}
                onValueChange={setSimulatedPrice}
                max={500}
                min={100}
                step={10}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Mudança de Preço</p>
              <p className={`text-lg font-bold ${impact.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {impact.priceChange >= 0 ? '+' : ''}{impact.priceChange.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Impacto Ocupação</p>
              <p className={`text-lg font-bold ${impact.occupancyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {impact.occupancyChange >= 0 ? '+' : ''}{impact.occupancyChange.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Impacto RevPAR</p>
              <p className={`text-lg font-bold ${impact.revparChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {impact.revparChange >= 0 ? '+' : ''}{impact.revparChange.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Receita Estimada</p>
              <p className="text-lg font-bold text-white">
                R$ {(impact.estimatedRevenue / 1000).toFixed(0)}k
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positioning Chart */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Mapa de Posicionamento - Preço vs Ocupação</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={positioningData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="price" 
                stroke="#94a3b8" 
                name="Preço Médio" 
                domain={['dataMin - 20', 'dataMax + 20']}
              />
              <YAxis 
                dataKey="occupancy" 
                stroke="#94a3b8" 
                name="Ocupação %" 
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value, name) => [
                  name === 'price' ? `R$ ${value}` : `${value}%`,
                  name === 'price' ? 'Preço' : 'Ocupação'
                ]}
              />
              <Scatter dataKey="occupancy">
                {positioningData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.isSimulated ? '#f59e0b' :
                      entry.isSelected ? '#3b82f6' : '#64748b'
                    } 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricePositioningSimulator;
