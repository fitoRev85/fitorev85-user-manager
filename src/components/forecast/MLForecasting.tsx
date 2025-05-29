
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Play, RefreshCw, Download, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const MLForecasting = () => {
  const [selectedModel, setSelectedModel] = useState('random_forest');
  const [forecastPeriod, setForecastPeriod] = useState('30');
  const [isTraining, setIsTraining] = useState(false);
  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 92.5,
    mse: 0.024,
    mae: 0.156,
    r2: 0.889
  });

  const [forecastData, setForecastData] = useState([
    { date: '2024-01-08', predicted: 85, confidence_lower: 82, confidence_upper: 88, actual: null },
    { date: '2024-01-09', predicted: 87, confidence_lower: 84, confidence_upper: 90, actual: null },
    { date: '2024-01-10', predicted: 89, confidence_lower: 86, confidence_upper: 92, actual: null },
    { date: '2024-01-11', predicted: 91, confidence_lower: 88, confidence_upper: 94, actual: null },
    { date: '2024-01-12', predicted: 88, confidence_lower: 85, confidence_upper: 91, actual: null },
    { date: '2024-01-13', predicted: 86, confidence_lower: 83, confidence_upper: 89, actual: null },
    { date: '2024-01-14', predicted: 84, confidence_lower: 81, confidence_upper: 87, actual: null }
  ]);

  const [seasonalityData, setSeasonalityData] = useState([
    { month: 'Jan', pattern: 75, trend: 78 },
    { month: 'Fev', pattern: 72, trend: 76 },
    { month: 'Mar', pattern: 85, trend: 88 },
    { month: 'Abr', pattern: 82, trend: 85 },
    { month: 'Mai', pattern: 78, trend: 80 },
    { month: 'Jun', pattern: 90, trend: 92 },
    { month: 'Jul', pattern: 95, trend: 96 },
    { month: 'Ago', pattern: 93, trend: 94 },
    { month: 'Set', pattern: 88, trend: 89 },
    { month: 'Out', pattern: 85, trend: 86 },
    { month: 'Nov', pattern: 80, trend: 82 },
    { month: 'Dez', pattern: 92, trend: 94 }
  ]);

  const [modelComparison, setModelComparison] = useState([
    { model: 'Linear Regression', accuracy: 78.5, training_time: '2s' },
    { model: 'Random Forest', accuracy: 92.5, training_time: '45s' },
    { model: 'ARIMA', accuracy: 88.2, training_time: '120s' },
    { model: 'Neural Network', accuracy: 94.1, training_time: '300s' }
  ]);

  const runForecast = () => {
    setIsTraining(true);
    // Simula treinamento do modelo
    setTimeout(() => {
      setIsTraining(false);
      // Aqui seria feita a chamada para a API do backend
      console.log(`Running ${selectedModel} forecast for ${forecastPeriod} days`);
    }, 3000);
  };

  const exportForecast = () => {
    // Simula export dos dados
    console.log('Exporting forecast data...');
  };

  return (
    <div className="space-y-6">
      {/* Controles do Modelo */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            Machine Learning Forecasting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Modelo ML</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="linear_regression">Linear Regression</SelectItem>
                  <SelectItem value="random_forest">Random Forest</SelectItem>
                  <SelectItem value="arima">ARIMA</SelectItem>
                  <SelectItem value="neural_network">Neural Network</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Período (dias)</label>
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="14">14 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={runForecast}
                disabled={isTraining}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                {isTraining ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Treinando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Executar Previsão
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-end">
              <Button
                onClick={exportForecast}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Métricas do Modelo */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
              <div className="text-sm text-blue-300">Acurácia</div>
              <div className="text-xl font-bold text-blue-400">{modelMetrics.accuracy}%</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
              <div className="text-sm text-green-300">R²</div>
              <div className="text-xl font-bold text-green-400">{modelMetrics.r2}</div>
            </div>
            <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-500/30">
              <div className="text-sm text-orange-300">MAE</div>
              <div className="text-xl font-bold text-orange-400">{modelMetrics.mae}</div>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
              <div className="text-sm text-purple-300">MSE</div>
              <div className="text-xl font-bold text-purple-400">{modelMetrics.mse}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previsões e Intervalos de Confiança */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Previsões com Intervalos de Confiança</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }} 
              />
              <Line type="monotone" dataKey="confidence_lower" stroke="#64748b" strokeDasharray="5 5" name="Limite Inferior" />
              <Line type="monotone" dataKey="confidence_upper" stroke="#64748b" strokeDasharray="5 5" name="Limite Superior" />
              <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={3} name="Previsão" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Análise de Sazonalidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Padrões Sazonais Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={seasonalityData}>
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
                <Line type="monotone" dataKey="pattern" stroke="#f59e0b" strokeWidth={2} name="Padrão Sazonal" />
                <Line type="monotone" dataKey="trend" stroke="#10b981" strokeWidth={2} name="Tendência" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Comparação de Modelos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modelComparison.map((model, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  model.model === 'Random Forest' ? 'bg-blue-500/20 border-blue-500/30' : 'bg-slate-700/50 border-slate-600/50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">{model.model}</span>
                    <span className="text-sm text-slate-400">{model.training_time}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-slate-600 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-400 h-2 rounded-full" 
                        style={{ width: `${model.accuracy}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white">{model.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MLForecasting;
