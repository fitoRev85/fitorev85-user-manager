
import { useState, useEffect, useMemo } from 'react';
import { useReservationData } from './useReservationData';
import { MLUtils, DataPoint, LinearRegressionResult, SeasonalPattern } from '@/lib/mlUtils';

interface ForecastResult {
  historical: DataPoint[];
  forecast: DataPoint[];
  seasonalPatterns: SeasonalPattern[];
  model: LinearRegressionResult;
  accuracy: {
    mae: number;
    mse: number;
    mape: number;
  };
  trend: 'crescente' | 'decrescente' | 'estável';
}

interface ManualAdjustment {
  date: string;
  originalValue: number;
  adjustedValue: number;
  reason: string;
}

export function useMLForecasting(propertyId: string) {
  const { data: reservations, loading } = useReservationData(propertyId);
  const [forecastDays, setForecastDays] = useState(30);
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustment[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'occupancy' | 'revenue' | 'adr'>('occupancy');

  // Processar dados históricos
  const historicalData = useMemo(() => {
    if (!reservations.length) return [];

    // Agrupar reservas por data
    const dailyData = new Map<string, { bookings: number; revenue: number; totalNights: number }>();
    
    reservations.forEach(reservation => {
      const checkinDate = new Date(reservation.data_checkin);
      if (isNaN(checkinDate.getTime())) return;

      const dateKey = checkinDate.toISOString().split('T')[0];
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, { bookings: 0, revenue: 0, totalNights: 0 });
      }

      const dayData = dailyData.get(dateKey)!;
      dayData.bookings++;
      dayData.revenue += reservation.valor_total || 0;
      dayData.totalNights += reservation.noites || 1;
    });

    // Converter para DataPoints
    const dataPoints: DataPoint[] = [];
    const sortedDates = Array.from(dailyData.keys()).sort();
    
    sortedDates.forEach((date, index) => {
      const data = dailyData.get(date)!;
      let value = 0;

      switch (selectedMetric) {
        case 'occupancy':
          value = (data.bookings / 100) * 100; // Assumindo 100 quartos como base
          break;
        case 'revenue':
          value = data.revenue;
          break;
        case 'adr':
          value = data.totalNights > 0 ? data.revenue / data.totalNights : 0;
          break;
      }

      dataPoints.push({
        x: index,
        y: value,
        date
      });
    });

    return dataPoints;
  }, [reservations, selectedMetric]);

  // Análise de sazonalidade
  const seasonalPatterns = useMemo(() => {
    return MLUtils.analyzeSeasonality(reservations);
  }, [reservations]);

  // Modelo de regressão linear
  const model = useMemo(() => {
    return MLUtils.linearRegression(historicalData);
  }, [historicalData]);

  // Previsões
  const forecast = useMemo(() => {
    if (historicalData.length === 0) return [];

    let baseForecast = MLUtils.generateForecast(
      historicalData,
      forecastDays,
      seasonalPatterns
    );

    // Aplicar ajustes manuais
    baseForecast = baseForecast.map(point => {
      const adjustment = manualAdjustments.find(adj => adj.date === point.date);
      if (adjustment) {
        return { ...point, y: adjustment.adjustedValue };
      }
      return point;
    });

    return baseForecast;
  }, [historicalData, forecastDays, seasonalPatterns, manualAdjustments]);

  // Métricas de precisão (usando dados de validação cruzada)
  const accuracy = useMemo(() => {
    if (historicalData.length < 10) {
      return { mae: 0, mse: 0, mape: 0 };
    }

    // Usar 80% dos dados para treino e 20% para teste
    const splitIndex = Math.floor(historicalData.length * 0.8);
    const trainData = historicalData.slice(0, splitIndex);
    const testData = historicalData.slice(splitIndex);

    const testModel = MLUtils.linearRegression(trainData);
    const predicted = testData.map(point => MLUtils.predict(point.x, testModel));
    const actual = testData.map(point => point.y);

    return MLUtils.calculateAccuracy(predicted, actual);
  }, [historicalData]);

  // Detectar tendência
  const trend = useMemo(() => {
    return MLUtils.detectTrend(historicalData);
  }, [historicalData]);

  // Funções para ajustes manuais
  const addManualAdjustment = (adjustment: ManualAdjustment) => {
    setManualAdjustments(prev => {
      const filtered = prev.filter(adj => adj.date !== adjustment.date);
      return [...filtered, adjustment];
    });
  };

  const removeManualAdjustment = (date: string) => {
    setManualAdjustments(prev => prev.filter(adj => adj.date !== date));
  };

  // Resultado final
  const result: ForecastResult = {
    historical: historicalData,
    forecast,
    seasonalPatterns,
    model,
    accuracy,
    trend
  };

  return {
    ...result,
    loading,
    forecastDays,
    setForecastDays,
    selectedMetric,
    setSelectedMetric,
    manualAdjustments,
    addManualAdjustment,
    removeManualAdjustment
  };
}
