
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { useReservationData } from '@/hooks/useReservationData';
import { Property } from '@/hooks/useProperties';
import { usePricingRules } from '@/hooks/usePricingRules';

interface PricingCalculatorProps {
  propertyId: string;
  property: Property;
}

const PricingCalculator = ({ propertyId, property }: PricingCalculatorProps) => {
  const { data: reservas } = useReservationData(propertyId);
  const { rules } = usePricingRules(propertyId);
  const [selectedDate, setSelectedDate] = useState('');
  const [basePrice, setBasePrice] = useState(200);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [factors, setFactors] = useState({
    occupancy: 0,
    seasonalMultiplier: 1,
    demandMultiplier: 1,
    weekendMultiplier: 1
  });

  useEffect(() => {
    if (selectedDate) {
      calculatePrice();
    }
  }, [selectedDate, basePrice, reservas, rules]);

  const calculatePrice = () => {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Calcular ocupação da data
    const dateReservations = reservas.filter(r => 
      r.data_checkin <= selectedDate && r.data_checkout > selectedDate
    );
    const occupancyRate = (dateReservations.length / property.rooms) * 100;

    // Encontrar regra sazonal
    const month = date.getMonth() + 1;
    const seasonalRule = rules.find(rule => 
      month >= rule.startMonth && month <= rule.endMonth
    );

    // Calcular multiplicadores
    const seasonalMultiplier = seasonalRule?.multiplier || 1;
    const occupancyMultiplier = calculateOccupancyMultiplier(occupancyRate);
    const weekendMultiplier = isWeekend ? 1.15 : 1;
    const demandMultiplier = calculateDemandMultiplier(date);

    const finalPrice = basePrice * seasonalMultiplier * occupancyMultiplier * weekendMultiplier * demandMultiplier;

    setCalculatedPrice(Math.round(finalPrice));
    setFactors({
      occupancy: occupancyRate,
      seasonalMultiplier,
      demandMultiplier,
      weekendMultiplier
    });
  };

  const calculateOccupancyMultiplier = (occupancy: number) => {
    if (occupancy < 30) return 0.85;
    if (occupancy < 50) return 0.95;
    if (occupancy < 70) return 1.0;
    if (occupancy < 85) return 1.15;
    return 1.3;
  };

  const calculateDemandMultiplier = (date: Date) => {
    // Lógica simples de demanda baseada em proximidade
    const today = new Date();
    const daysUntil = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 7) return 1.2;
    if (daysUntil < 30) return 1.1;
    if (daysUntil < 90) return 1.0;
    return 0.9;
  };

  const getPriceRecommendation = () => {
    const currentADR = property.adr || 250;
    const difference = ((calculatedPrice - currentADR) / currentADR) * 100;
    
    if (difference > 10) return { type: 'increase', message: 'Recomendado aumentar preço', color: 'text-green-400' };
    if (difference < -10) return { type: 'decrease', message: 'Considerar reduzir preço', color: 'text-red-400' };
    return { type: 'maintain', message: 'Preço atual adequado', color: 'text-blue-400' };
  };

  const recommendation = calculatedPrice > 0 ? getPriceRecommendation() : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de Preços
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Data da Reserva</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Preço Base (R$)</Label>
            <Input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <Button 
            onClick={calculatePrice}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!selectedDate}
          >
            Calcular Preço Otimizado
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Resultado da Análise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {calculatedPrice > 0 ? (
            <>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-400">
                  R$ {calculatedPrice.toLocaleString('pt-BR')}
                </div>
                <p className="text-slate-400">Preço recomendado</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Ocupação</p>
                  <p className="text-lg font-semibold text-white">
                    {factors.occupancy.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Fator Sazonal</p>
                  <p className="text-lg font-semibold text-white">
                    {factors.seasonalMultiplier.toFixed(2)}x
                  </p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Fator Demanda</p>
                  <p className="text-lg font-semibold text-white">
                    {factors.demandMultiplier.toFixed(2)}x
                  </p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Fator Weekend</p>
                  <p className="text-lg font-semibold text-white">
                    {factors.weekendMultiplier.toFixed(2)}x
                  </p>
                </div>
              </div>

              {recommendation && (
                <div className={`flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg ${recommendation.color}`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">{recommendation.message}</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              Selecione uma data para calcular o preço otimizado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingCalculator;
