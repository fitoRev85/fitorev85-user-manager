
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Users, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

const ForecastDashboard = () => {
  const [kpiData, setKpiData] = useState({
    currentOccupancy: 78.5,
    forecast30Days: 82.3,
    currentRevpar: 225.50,
    forecastRevpar: 248.20,
    totalBookings: 1247,
    cancellationRate: 8.2
  });

  const [occupancyTrend, setOccupancyTrend] = useState([
    { date: '2024-01-01', historical: 75, predicted: 78, actual: 76 },
    { date: '2024-01-02', historical: 78, predicted: 80, actual: 79 },
    { date: '2024-01-03', historical: 80, predicted: 82, actual: 81 },
    { date: '2024-01-04', historical: 82, predicted: 85, actual: 83 },
    { date: '2024-01-05', historical: 85, predicted: 87, actual: 86 },
    { date: '2024-01-06', historical: 88, predicted: 90, actual: 89 },
    { date: '2024-01-07', historical: 90, predicted: 88, actual: 87 }
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Ocupação prevista abaixo da meta para próxima semana', severity: 'medium' },
    { id: 2, type: 'success', message: 'RevPAR superando previsão em 5%', severity: 'low' },
    { id: 3, type: 'error', message: 'Taxa de cancelamento acima do normal', severity: 'high' }
  ]);

  const [roomTypeData, setRoomTypeData] = useState([
    { type: 'Standard', occupancy: 85, adr: 180, forecast: 88 },
    { type: 'Superior', occupancy: 78, adr: 220, forecast: 82 },
    { type: 'Deluxe', occupancy: 72, adr: 280, forecast: 75 },
    { type: 'Suite', occupancy: 65, adr: 420, forecast: 70 }
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Ocupação Atual</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{kpiData.currentOccupancy}%</div>
            <p className="text-xs text-slate-400">
              Previsão 30 dias: <span className="text-green-400">{kpiData.forecast30Days}%</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">RevPAR</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {kpiData.currentRevpar}</div>
            <p className="text-xs text-slate-400">
              Previsão: <span className="text-green-400">R$ {kpiData.forecastRevpar}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{kpiData.totalBookings.toLocaleString()}</div>
            <p className="text-xs text-slate-400">
              Cancelamentos: <span className="text-red-400">{kpiData.cancellationRate}%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Alertas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.severity === 'high' ? 'bg-red-500/20 border border-red-500/30' :
                alert.severity === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                'bg-green-500/20 border border-green-500/30'
              }`}>
                {getAlertIcon(alert.type)}
                <span className="text-slate-300">{alert.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Ocupação: Histórico vs Previsão</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyTrend}>
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
                <Line type="monotone" dataKey="historical" stroke="#64748b" strokeWidth={2} name="Histórico" />
                <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} name="Previsão" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Atual" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Performance por Tipo de Quarto</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="type" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }} 
                />
                <Bar dataKey="occupancy" fill="#3b82f6" name="Ocupação Atual" />
                <Bar dataKey="forecast" fill="#10b981" name="Previsão" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForecastDashboard;
