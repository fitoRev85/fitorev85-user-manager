
export interface DataPoint {
  x: number;
  y: number;
  date?: string;
}

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  equation: string;
}

export interface SeasonalPattern {
  month: number;
  averageOccupancy: number;
  averageRate: number;
  bookingCount: number;
  seasonMultiplier: number;
}

export class MLUtils {
  // Regressão Linear Simples
  static linearRegression(dataPoints: DataPoint[]): LinearRegressionResult {
    const n = dataPoints.length;
    if (n < 2) {
      return { slope: 0, intercept: 0, r2: 0, equation: 'Dados insuficientes' };
    }

    const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0);
    const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
    const sumXY = dataPoints.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = dataPoints.reduce((sum, point) => sum + point.x * point.x, 0);
    const sumYY = dataPoints.reduce((sum, point) => sum + point.y * point.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calcular R²
    const yMean = sumY / n;
    const ssTotal = dataPoints.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
    const ssResidual = dataPoints.reduce((sum, point) => {
      const predicted = slope * point.x + intercept;
      return sum + Math.pow(point.y - predicted, 2);
    }, 0);
    
    const r2 = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;

    return {
      slope,
      intercept,
      r2: Math.max(0, Math.min(1, r2)),
      equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(2)}`
    };
  }

  // Previsão usando regressão linear
  static predict(x: number, model: LinearRegressionResult): number {
    return model.slope * x + model.intercept;
  }

  // Análise de sazonalidade
  static analyzeSeasonality(reservations: any[]): SeasonalPattern[] {
    const monthlyData = new Map<number, { occupancy: number[], rates: number[], count: number }>();

    // Agrupar por mês
    reservations.forEach(reservation => {
      const checkinDate = new Date(reservation.data_checkin);
      if (isNaN(checkinDate.getTime())) return;

      const month = checkinDate.getMonth() + 1;
      const rate = reservation.valor_total / (reservation.noites || 1);

      if (!monthlyData.has(month)) {
        monthlyData.set(month, { occupancy: [], rates: [], count: 0 });
      }

      const monthData = monthlyData.get(month)!;
      monthData.occupancy.push(1); // Cada reserva conta como ocupação
      monthData.rates.push(rate);
      monthData.count++;
    });

    // Calcular médias por mês
    const patterns: SeasonalPattern[] = [];
    for (let month = 1; month <= 12; month++) {
      const data = monthlyData.get(month) || { occupancy: [], rates: [], count: 0 };
      
      const averageOccupancy = data.occupancy.length > 0 
        ? (data.occupancy.length / 30) * 100 // Aproximação de ocupação mensal
        : 0;
      
      const averageRate = data.rates.length > 0
        ? data.rates.reduce((sum, rate) => sum + rate, 0) / data.rates.length
        : 0;

      patterns.push({
        month,
        averageOccupancy,
        averageRate,
        bookingCount: data.count,
        seasonMultiplier: 1
      });
    }

    // Calcular multiplicadores sazonais
    const overallAverage = patterns.reduce((sum, p) => sum + p.averageOccupancy, 0) / 12;
    patterns.forEach(pattern => {
      pattern.seasonMultiplier = overallAverage > 0 ? pattern.averageOccupancy / overallAverage : 1;
    });

    return patterns;
  }

  // Detectar tendências
  static detectTrend(dataPoints: DataPoint[]): 'crescente' | 'decrescente' | 'estável' {
    if (dataPoints.length < 2) return 'estável';

    const regression = this.linearRegression(dataPoints);
    
    if (Math.abs(regression.slope) < 0.01) return 'estável';
    return regression.slope > 0 ? 'crescente' : 'decrescente';
  }

  // Calcular métricas de precisão
  static calculateAccuracy(predicted: number[], actual: number[]): {
    mae: number;
    mse: number;
    mape: number;
  } {
    if (predicted.length !== actual.length) {
      return { mae: 0, mse: 0, mape: 0 };
    }

    const n = predicted.length;
    let sumAbsError = 0;
    let sumSquaredError = 0;
    let sumPercentError = 0;

    for (let i = 0; i < n; i++) {
      const error = Math.abs(predicted[i] - actual[i]);
      sumAbsError += error;
      sumSquaredError += error * error;
      
      if (actual[i] !== 0) {
        sumPercentError += Math.abs((predicted[i] - actual[i]) / actual[i]);
      }
    }

    return {
      mae: sumAbsError / n,
      mse: sumSquaredError / n,
      mape: (sumPercentError / n) * 100
    };
  }

  // Gerar previsões futuras
  static generateForecast(
    historicalData: DataPoint[],
    daysToForecast: number,
    seasonalPatterns?: SeasonalPattern[]
  ): DataPoint[] {
    if (historicalData.length === 0) return [];

    const model = this.linearRegression(historicalData);
    const forecast: DataPoint[] = [];
    const lastX = Math.max(...historicalData.map(p => p.x));

    for (let i = 1; i <= daysToForecast; i++) {
      const x = lastX + i;
      let predicted = this.predict(x, model);

      // Aplicar sazonalidade se disponível
      if (seasonalPatterns) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        const month = futureDate.getMonth() + 1;
        const seasonalPattern = seasonalPatterns.find(p => p.month === month);
        
        if (seasonalPattern) {
          predicted *= seasonalPattern.seasonMultiplier;
        }
      }

      // Garantir valores positivos e realistas
      predicted = Math.max(0, Math.min(100, predicted));

      forecast.push({
        x,
        y: predicted,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    return forecast;
  }
}
