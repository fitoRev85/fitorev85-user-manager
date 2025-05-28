
import React, { useState, useEffect } from 'react';
import { 
  Calendar, TrendingUp, Target, BarChart3, DollarSign, Users, Percent, Edit3, Save, X, 
  ChevronLeft, ChevronRight, Eye, ArrowLeft, Building2, LogOut, FileText, 
  Calculator, Package, Settings, AlertTriangle, Plus, Minus, RefreshCw,
  ArrowUp, ArrowDown, PieChart, Download, CheckCircle, Clock, AlertCircle, Bed, 
  PlayCircle, Edit, Trash2, Play, Zap, RotateCcw, Brain
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, ScatterChart, Scatter, AreaChart, Area,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const RMSForecastPace = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProperty, setSelectedProperty] = useState(propertyId || '1');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingForecast, setEditingForecast] = useState(null);
  const [forecastData, setForecastData] = useState({});
  const [paceData, setPaceData] = useState({});
  const [autoForecastEnabled, setAutoForecastEnabled] = useState(false);

  const properties = [
    { 
      id: '1', 
      name: 'Grand Hotel Luxo', 
      category: 'Luxo', 
      uh: 120, 
      city: 'São Paulo',
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop',
      revpar: 285.50,
      occupancy: 78,
      adr: 365
    },
    { 
      id: '2', 
      name: 'Boutique Charm', 
      category: 'Boutique', 
      uh: 45, 
      city: 'Rio de Janeiro',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop',
      revpar: 195.30,
      occupancy: 85,
      adr: 230
    },
    { 
      id: '3', 
      name: 'Resort Paradise', 
      category: 'Resort', 
      uh: 200, 
      city: 'Florianópolis',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop',
      revpar: 220.75,
      occupancy: 82,
      adr: 269
    },
    { 
      id: '4', 
      name: 'Business Center', 
      category: 'Corporativo', 
      uh: 80, 
      city: 'Brasília',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
      revpar: 165.40,
      occupancy: 72,
      adr: 230
    }
  ];

  useEffect(() => {
    const initializeForecastData = () => {
      const data = {};
      const pace = {};
      
      properties.forEach(property => {
        data[property.id] = {};
        pace[property.id] = {};
        
        for (let year = 2024; year <= 2025; year++) {
          data[property.id][year] = {};
          pace[property.id][year] = {};
          
          for (let month = 0; month < 12; month++) {
            const baseOccupancy = 65 + Math.random() * 25;
            const baseDailyRate = property.category === 'Luxo' ? 450 : 
                                property.category === 'Resort' ? 380 :
                                property.category === 'Boutique' ? 320 : 280;
            
            data[property.id][year][month] = {
              occupancyForecast: Math.round(baseOccupancy),
              dailyRateForecast: Math.round(baseDailyRate + (Math.random() - 0.5) * 100),
              revenueForecast: Math.round(property.uh * baseOccupancy / 100 * baseDailyRate * 30),
              occupancyActual: Math.round(baseOccupancy * (0.85 + Math.random() * 0.3)),
              dailyRateActual: Math.round((baseDailyRate + (Math.random() - 0.5) * 50)),
              revenueActual: 0,
              bookingsToDate: Math.round(property.uh * (baseOccupancy * 0.7) / 100),
              lastYearOccupancy: Math.round(baseOccupancy * (0.9 + Math.random() * 0.2)),
              lastYearRevenue: Math.round(property.uh * baseOccupancy * 0.95 / 100 * (baseDailyRate * 0.9) * 30)
            };

            const currentData = data[property.id][year][month];
            currentData.revenueActual = Math.round(currentData.occupancyActual / 100 * property.uh * currentData.dailyRateActual * 30);
            
            pace[property.id][year][month] = {
              bookingsPace: currentData.bookingsToDate / (currentData.occupancyForecast / 100 * property.uh) * 100,
              revenuePace: currentData.revenueActual / currentData.revenueForecast * 100,
              occupancyPace: currentData.occupancyActual / currentData.occupancyForecast * 100
            };
          }
        }
      });
      
      setForecastData(data);
      setPaceData(pace);
    };

    initializeForecastData();
  }, []);

  useEffect(() => {
    if (propertyId) {
      setSelectedProperty(propertyId);
    }
  }, [propertyId]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getCurrentProperty = () => properties.find(p => p.id === selectedProperty);
  
  const getCurrentMonthData = () => {
    if (!forecastData[selectedProperty] || !forecastData[selectedProperty][selectedYear]) {
      return {
        occupancyForecast: 0,
        dailyRateForecast: 0,
        revenueForecast: 0,
        occupancyActual: 0,
        dailyRateActual: 0,
        revenueActual: 0,
        bookingsToDate: 0,
        lastYearOccupancy: 0,
        lastYearRevenue: 0
      };
    }
    return forecastData[selectedProperty][selectedYear][selectedMonth] || {
      occupancyForecast: 0,
      dailyRateForecast: 0,
      revenueForecast: 0,
      occupancyActual: 0,
      dailyRateActual: 0,
      revenueActual: 0,
      bookingsToDate: 0,
      lastYearOccupancy: 0,
      lastYearRevenue: 0
    };
  };

  const getCurrentPaceData = () => {
    if (!paceData[selectedProperty] || !paceData[selectedProperty][selectedYear]) {
      return {
        bookingsPace: 0,
        revenuePace: 0,
        occupancyPace: 0
      };
    }
    return paceData[selectedProperty][selectedYear][selectedMonth] || {
      bookingsPace: 0,
      revenuePace: 0,
      occupancyPace: 0
    };
  };

  const handleForecastEdit = (field, value) => {
    const newData = { ...forecastData };
    if (!newData[selectedProperty]) newData[selectedProperty] = {};
    if (!newData[selectedProperty][selectedYear]) newData[selectedProperty][selectedYear] = {};
    if (!newData[selectedProperty][selectedYear][selectedMonth]) {
      newData[selectedProperty][selectedYear][selectedMonth] = {};
    }
    
    newData[selectedProperty][selectedYear][selectedMonth][field] = parseInt(value) || 0;
    
    const monthData = newData[selectedProperty][selectedYear][selectedMonth];
    const property = getCurrentProperty();
    
    if (field === 'occupancyForecast' || field === 'dailyRateForecast') {
      monthData.revenueForecast = Math.round(
        (monthData.occupancyForecast || 0) / 100 * 
        property.uh * 
        (monthData.dailyRateForecast || 0) * 30
      );
    }
    
    setForecastData(newData);
    
    const newPaceData = { ...paceData };
    if (!newPaceData[selectedProperty]) newPaceData[selectedProperty] = {};
    if (!newPaceData[selectedProperty][selectedYear]) newPaceData[selectedProperty][selectedYear] = {};
    if (!newPaceData[selectedProperty][selectedYear][selectedMonth]) {
      newPaceData[selectedProperty][selectedYear][selectedMonth] = {};
    }
    
    const currentPace = newPaceData[selectedProperty][selectedYear][selectedMonth];
    currentPace.bookingsPace = (monthData.bookingsToDate || 0) / ((monthData.occupancyForecast || 1) / 100 * property.uh) * 100;
    currentPace.revenuePace = (monthData.revenueActual || 0) / (monthData.revenueForecast || 1) * 100;
    currentPace.occupancyPace = (monthData.occupancyActual || 0) / (monthData.occupancyForecast || 1) * 100;
    
    setPaceData(newPaceData);
  };

  const generateAutoForecast = () => {
    const property = getCurrentProperty();
    const historicalData = [];
    
    // Simula dados históricos dos últimos 2 anos
    for (let year = 2022; year <= 2023; year++) {
      for (let month = 0; month < 12; month++) {
        const seasonality = 1 + 0.3 * Math.sin((month - 2) * Math.PI / 6); // Pico no verão
        const baseOccupancy = 70 * seasonality;
        const baseRate = property.category === 'Luxo' ? 400 : 
                        property.category === 'Resort' ? 350 :
                        property.category === 'Boutique' ? 280 : 250;
        
        historicalData.push({
          year,
          month,
          occupancy: Math.round(baseOccupancy + (Math.random() - 0.5) * 20),
          rate: Math.round(baseRate * seasonality + (Math.random() - 0.5) * 50),
          revenue: Math.round(property.uh * baseOccupancy / 100 * baseRate * seasonality * 30)
        });
      }
    }
    
    // Calcula forecast baseado na média histórica com ajustes
    const newData = { ...forecastData };
    const currentMonthHistorical = historicalData.filter(d => d.month === selectedMonth);
    const avgOccupancy = currentMonthHistorical.reduce((sum, d) => sum + d.occupancy, 0) / currentMonthHistorical.length;
    const avgRate = currentMonthHistorical.reduce((sum, d) => sum + d.rate, 0) / currentMonthHistorical.length;
    
    // Aplica tendência de crescimento de 5%
    const growthFactor = 1.05;
    const marketAdjustment = Math.random() * 0.1 + 0.95; // Variação de mercado
    
    if (!newData[selectedProperty]) newData[selectedProperty] = {};
    if (!newData[selectedProperty][selectedYear]) newData[selectedProperty][selectedYear] = {};
    if (!newData[selectedProperty][selectedYear][selectedMonth]) {
      newData[selectedProperty][selectedYear][selectedMonth] = getCurrentMonthData();
    }
    
    newData[selectedProperty][selectedYear][selectedMonth].occupancyForecast = 
      Math.round(avgOccupancy * growthFactor * marketAdjustment);
    newData[selectedProperty][selectedYear][selectedMonth].dailyRateForecast = 
      Math.round(avgRate * growthFactor * marketAdjustment);
    newData[selectedProperty][selectedYear][selectedMonth].revenueForecast = 
      Math.round(newData[selectedProperty][selectedYear][selectedMonth].occupancyForecast / 100 * 
                property.uh * 
                newData[selectedProperty][selectedYear][selectedMonth].dailyRateForecast * 30);
    
    setForecastData(newData);
  };

  const generateChartData = () => {
    const data = [];
    for (let month = 0; month < 12; month++) {
      const monthData = forecastData[selectedProperty]?.[selectedYear]?.[month];
      const paceMonthData = paceData[selectedProperty]?.[selectedYear]?.[month];
      
      data.push({
        month: monthNames[month].substring(0, 3),
        forecast: monthData?.occupancyForecast || 0,
        actual: monthData?.occupancyActual || 0,
        lastYear: monthData?.lastYearOccupancy || 0,
        pace: paceMonthData?.occupancyPace || 0
      });
    }
    return data;
  };

  const generateRevenueChartData = () => {
    const data = [];
    for (let month = 0; month < 12; month++) {
      const monthData = forecastData[selectedProperty]?.[selectedYear]?.[month];
      
      data.push({
        month: monthNames[month].substring(0, 3),
        forecast: monthData?.revenueForecast || 0,
        actual: monthData?.revenueActual || 0,
        lastYear: monthData?.lastYearRevenue || 0
      });
    }
    return data;
  };

  // Dashboard KPIs Component
  const DashboardKPIs = () => {
    const kpiData = {
      revpar: { current: 225.50, forecast: 218.20, lastYear: 198.75, target: 230.00 },
      adr: { current: 280.25, forecast: 275.80, lastYear: 265.40, target: 285.00 },
      occupancy: { current: 79.6, forecast: 77.2, lastYear: 69.7, target: 85.0 },
      goppar: { current: 78.75, forecast: 75.20, lastYear: 68.90, target: 82.00 }
    };

    const monthlyTrends = [
      { month: 'Jan', revpar: 198, adr: 265, occupancy: 69 },
      { month: 'Fev', revpar: 205, adr: 268, occupancy: 72 },
      { month: 'Mar', revpar: 218, adr: 272, occupancy: 78 },
      { month: 'Abr', revpar: 225, adr: 280, occupancy: 79 },
      { month: 'Mai', revpar: 226, adr: 280, occupancy: 80 }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Dashboard KPIs</h2>
            <p className="text-slate-400">Monitoramento de performance da propriedade</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(kpiData).map(([key, data]) => (
            <div key={key} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2 capitalize">{key}</h3>
              <div className="text-3xl font-bold text-white mb-1">
                {key === 'occupancy' ? `${data.current.toFixed(1)}%` : `R$ ${data.current.toFixed(2)}`}
              </div>
              <div className="text-sm text-slate-400">
                vs Forecast: {((data.current - data.forecast) / data.forecast * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tendências Mensais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
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
              <Line type="monotone" dataKey="revpar" stroke="#3b82f6" strokeWidth={3} name="RevPAR" />
              <Line type="monotone" dataKey="adr" stroke="#10b981" strokeWidth={3} name="ADR" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Manual Forecast Component
  const ManualForecast = () => {
    const currentMonthData = getCurrentMonthData();
    const currentPaceData = getCurrentPaceData();
    const property = getCurrentProperty();

    if (!property) {
      return <div className="text-slate-300 p-8">Carregando dados...</div>;
    }

    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Propriedade</label>
              <select 
                value={selectedProperty} 
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white"
              >
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ano</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mês</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Forecast Automático</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoForecastEnabled}
                  onChange={(e) => setAutoForecastEnabled(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">Ativar IA</span>
              </div>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={generateAutoForecast}
                disabled={!autoForecastEnabled}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors text-sm"
              >
                <Brain className="w-4 h-4 mr-1 inline" />
                Gerar Auto
              </button>
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <div className="text-xs text-blue-300 font-medium">{property.name}</div>
                <div className="text-xs text-blue-400">{property.uh} UH</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Percent className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Ocupação</span>
              </div>
              {editingForecast === 'occupancy' ? (
                <div className="flex items-center space-x-1">
                  <button onClick={() => setEditingForecast(null)} className="text-green-400 hover:text-green-300">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingForecast(null)} className="text-slate-400 hover:text-slate-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditingForecast('occupancy')} className="text-slate-400 hover:text-slate-300">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Forecast:</span>
                {editingForecast === 'occupancy' ? (
                  <input
                    type="number"
                    value={currentMonthData.occupancyForecast || ''}
                    onChange={(e) => handleForecastEdit('occupancyForecast', e.target.value)}
                    className="w-16 px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-right text-white"
                    max="100"
                    min="0"
                  />
                ) : (
                  <span className="font-semibold text-blue-400">{currentMonthData.occupancyForecast}%</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Atual:</span>
                <span className="font-semibold text-white">{currentMonthData.occupancyActual}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Pace:</span>
                <span className={`font-semibold ${currentPaceData.occupancyPace >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                  {currentPaceData.occupancyPace.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="font-medium text-white">Diária Média</span>
              </div>
              {editingForecast === 'rate' ? (
                <div className="flex items-center space-x-1">
                  <button onClick={() => setEditingForecast(null)} className="text-green-400 hover:text-green-300">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingForecast(null)} className="text-slate-400 hover:text-slate-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditingForecast('rate')} className="text-slate-400 hover:text-slate-300">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Forecast:</span>
                {editingForecast === 'rate' ? (
                  <input
                    type="number"
                    value={currentMonthData.dailyRateForecast || ''}
                    onChange={(e) => handleForecastEdit('dailyRateForecast', e.target.value)}
                    className="w-20 px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-right text-white"
                  />
                ) : (
                  <span className="font-semibold text-green-400">R$ {currentMonthData.dailyRateForecast}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Atual:</span>
                <span className="font-semibold text-white">R$ {currentMonthData.dailyRateActual}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Variação:</span>
                <span className={`font-semibold ${currentMonthData.dailyRateActual >= currentMonthData.dailyRateForecast ? 'text-green-400' : 'text-red-400'}`}>
                  {((currentMonthData.dailyRateActual / currentMonthData.dailyRateForecast - 1) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-white">Receita</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Forecast:</span>
                <span className="font-semibold text-purple-400">R$ {currentMonthData.revenueForecast.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Atual:</span>
                <span className="font-semibold text-white">R$ {currentMonthData.revenueActual.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Pace:</span>
                <span className={`font-semibold ${currentPaceData.revenuePace >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                  {currentPaceData.revenuePace.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span className="font-medium text-white">Reservas</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Objetivo:</span>
                <span className="font-semibold text-indigo-400">{Math.round(currentMonthData.occupancyForecast / 100 * property.uh)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Atual:</span>
                <span className="font-semibold text-white">{currentMonthData.bookingsToDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Pace:</span>
                <span className={`font-semibold ${currentPaceData.bookingsPace >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                  {currentPaceData.bookingsPace.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ocupação: Forecast vs Atual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateChartData()}>
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
                <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} name="Forecast" />
                <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Atual" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Receita Anual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateRevenueChartData()}>
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
                  formatter={(value) => [`R$ ${value.toLocaleString()}`, '']} 
                />
                <Bar dataKey="forecast" fill="#8B5CF6" name="Forecast" />
                <Bar dataKey="actual" fill="#10B981" name="Atual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Revenue Analytics Component
  const RevenueAnalytics = () => {
    const [analyticsTab, setAnalyticsTab] = useState('segmentation');

    const segmentationData = [
      { segment: 'Corporate', revenue: 45000, percentage: 35, adr: 320, nights: 450 },
      { segment: 'Leisure', revenue: 52000, percentage: 40, adr: 280, nights: 620 },
      { segment: 'Groups', revenue: 19500, percentage: 15, adr: 240, nights: 325 },
      { segment: 'Online', revenue: 13000, percentage: 10, adr: 310, nights: 135 }
    ];

    const seasonalityData = [
      { month: 'Jan', low: 60, high: 85, avg: 72 },
      { month: 'Feb', low: 65, high: 88, avg: 76 },
      { month: 'Mar', low: 70, high: 92, avg: 81 },
      { month: 'Apr', low: 68, high: 89, avg: 78 },
      { month: 'May', low: 72, high: 94, avg: 83 },
      { month: 'Jun', low: 75, high: 96, avg: 85 },
      { month: 'Jul', low: 78, high: 98, avg: 88 },
      { month: 'Aug', low: 76, high: 97, avg: 86 },
      { month: 'Sep', low: 74, high: 95, avg: 84 },
      { month: 'Oct', low: 71, high: 93, avg: 82 },
      { month: 'Nov', low: 68, high: 90, avg: 79 },
      { month: 'Dec', low: 65, high: 87, avg: 76 }
    ];

    const competitorData = [
      { name: 'Hotel A', revpar: 245, occupancy: 82, adr: 299 },
      { name: 'Hotel B', revpar: 235, occupancy: 79, adr: 297 },
      { name: 'Nossa Propriedade', revpar: 225, occupancy: 78, adr: 289 },
      { name: 'Hotel C', revpar: 215, occupancy: 76, adr: 283 },
      { name: 'Hotel D', revpar: 205, occupancy: 74, adr: 277 }
    ];

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Revenue Analytics</h2>
          <p className="text-slate-400">Análises detalhadas de sazonalidade, segmentação e pick-up</p>
        </div>

        <div className="flex space-x-1 mb-6 bg-slate-800/50 backdrop-blur-lg rounded-xl p-2 border border-slate-700/50">
          {[
            { id: 'segmentation', label: 'Segmentação', icon: PieChart },
            { id: 'seasonality', label: 'Sazonalidade', icon: Calendar },
            { id: 'competitive', label: 'Competitivo', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAnalyticsTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                analyticsTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {analyticsTab === 'segmentation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Segmento</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={segmentationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="percentage"
                    nameKey="segment"
                  >
                    {segmentationData.map((entry, index) => (
                      <Cell key={index} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance por Segmento</h3>
              <div className="space-y-4">
                {segmentationData.map((segment, index) => (
                  <div key={segment.segment} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{segment.segment}</span>
                      <span className="text-sm text-slate-400">{segment.percentage}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Receita</span>
                        <div className="font-semibold text-white">R$ {segment.revenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">ADR</span>
                        <div className="font-semibold text-white">R$ {segment.adr}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Room Nights</span>
                        <div className="font-semibold text-white">{segment.nights}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {analyticsTab === 'seasonality' && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Análise de Sazonalidade</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={seasonalityData}>
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
                <Area type="monotone" dataKey="high" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="avg" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="low" stackId="3" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {analyticsTab === 'competitive' && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Análise Competitiva</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 font-semibold text-white">Hotel</th>
                    <th className="text-right py-3 px-4 font-semibold text-white">RevPAR</th>
                    <th className="text-right py-3 px-4 font-semibold text-white">Ocupação</th>
                    <th className="text-right py-3 px-4 font-semibold text-white">ADR</th>
                    <th className="text-center py-3 px-4 font-semibold text-white">Posição</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorData.map((hotel, index) => (
                    <tr key={hotel.name} className={`border-b border-slate-700 ${hotel.name === 'Nossa Propriedade' ? 'bg-blue-500/20' : ''}`}>
                      <td className="py-3 px-4 font-medium text-white">{hotel.name}</td>
                      <td className="py-3 px-4 text-right text-white">R$ {hotel.revpar}</td>
                      <td className="py-3 px-4 text-right text-white">{hotel.occupancy}%</td>
                      <td className="py-3 px-4 text-right text-white">R$ {hotel.adr}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-slate-500/20 text-slate-300' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-slate-600/20 text-slate-400'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Strategic Tools Component
  const StrategicTools = () => {
    const [toolsTab, setToolsTab] = useState('simulator');
    const [simulationRunning, setSimulationRunning] = useState(false);
    const [optimizationRunning, setOptimizationRunning] = useState(false);

    const [scenarioData, setScenarioData] = useState({
      baseRevenue: 125000,
      currentOccupancy: 78,
      avgRate: 285,
      segments: {
        corporate: { rate: 320, allocation: 35, demand: 85 },
        leisure: { rate: 265, allocation: 40, demand: 90 },
        groups: { rate: 240, allocation: 15, demand: 70 },
        online: { rate: 295, allocation: 10, demand: 95 }
      }
    });

    const [simulationResults, setSimulationResults] = useState(null);
    const [optimizationResults, setOptimizationResults] = useState(null);

    const runSimulation = () => {
      setSimulationRunning(true);
      setTimeout(() => {
        const scenarios = [
          { name: 'Cenário Atual', revenue: 125000, occupancy: 78, adr: 285, revpar: 222 },
          { name: 'Otimista (+15%)', revenue: 143750, occupancy: 85, adr: 310, revpar: 264 },
          { name: 'Conservador (-10%)', revenue: 112500, occupancy: 72, adr: 270, revpar: 194 },
          { name: 'Agressivo (+25%)', revenue: 156250, occupancy: 88, adr: 325, revpar: 286 }
        ];
        
        setSimulationResults(scenarios);
        setSimulationRunning(false);
      }, 2000);
    };

    const runOptimization = () => {
      setOptimizationRunning(true);
      setTimeout(() => {
        const optimization = {
          current: {
            corporate: 35, leisure: 40, groups: 15, online: 10,
            revenue: 125000, occupancy: 78
          },
          optimized: {
            corporate: 42, leisure: 35, groups: 12, online: 11,
            revenue: 138500, occupancy: 82
          },
          improvement: {
            revenue: 13500,
            occupancy: 4,
            revpar: 28
          }
        };
        
        setOptimizationResults(optimization);
        setOptimizationRunning(false);
      }, 3000);
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Ferramentas Estratégicas</h2>
          <p className="text-slate-400">Simulador de Cenários e Otimizador de Mix</p>
        </div>

        <div className="flex space-x-1 mb-6 bg-slate-800/50 backdrop-blur-lg rounded-xl p-2 border border-slate-700/50">
          <button
            onClick={() => setToolsTab('simulator')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              toolsTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Simulador de Cenários
            </div>
          </button>
          <button
            onClick={() => setToolsTab('optimizer')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              toolsTab === 'optimizer'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Otimizador de Mix
            </div>
          </button>
        </div>

        {toolsTab === 'simulator' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Simulador de Cenários</h3>
                <div className="flex gap-3">
                  <button
                    onClick={runSimulation}
                    disabled={simulationRunning}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {simulationRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Simulando...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Executar Simulação
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-slate-300">Receita Base</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    R$ {scenarioData.baseRevenue.toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Percent className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-slate-300">Ocupação</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {scenarioData.currentOccupancy}%
                  </div>
                </div>

                <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    <span className="font-medium text-slate-300">Tarifa Média</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">
                    R$ {scenarioData.avgRate}
                  </div>
                </div>

                <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-slate-300">RevPAR</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">
                    R$ {Math.round(scenarioData.currentOccupancy * scenarioData.avgRate / 100)}
                  </div>
                </div>
              </div>

              {simulationResults && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Resultados dos Cenários</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                      <h5 className="font-medium text-slate-300 mb-3">Comparação de Receita</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={simulationResults}>
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
                            formatter={(value) => `R$ ${value.toLocaleString()}`} 
                          />
                          <Bar dataKey="revenue" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                      <h5 className="font-medium text-slate-300 mb-3">Comparação de RevPAR</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={simulationResults}>
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
                            formatter={(value) => `R$ ${value}`} 
                          />
                          <Line type="monotone" dataKey="revpar" stroke="#10b981" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-700 border border-slate-600">
                          <th className="p-3 text-left font-medium text-white">Cenário</th>
                          <th className="p-3 text-right font-medium text-white">Receita</th>
                          <th className="p-3 text-right font-medium text-white">Ocupação</th>
                          <th className="p-3 text-right font-medium text-white">ADR</th>
                          <th className="p-3 text-right font-medium text-white">RevPAR</th>
                          <th className="p-3 text-center font-medium text-white">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulationResults.map((scenario, index) => (
                          <tr key={index} className="border-b border-slate-600 hover:bg-slate-700/30">
                            <td className="p-3 font-medium text-white">{scenario.name}</td>
                            <td className="p-3 text-right text-white">R$ {scenario.revenue.toLocaleString()}</td>
                            <td className="p-3 text-right text-white">{scenario.occupancy}%</td>
                            <td className="p-3 text-right text-white">R$ {scenario.adr}</td>
                            <td className="p-3 text-right text-white">R$ {scenario.revpar}</td>
                            <td className="p-3 text-center">
                              {index === 0 ? (
                                <span className="px-2 py-1 bg-slate-600/50 text-slate-300 rounded-full text-xs">Atual</span>
                              ) : scenario.revenue > 125000 ? (
                                <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-orange-400 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {toolsTab === 'optimizer' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Otimizador de Mix de Segmentos</h3>
                <div className="flex gap-3">
                  <button
                    onClick={runOptimization}
                    disabled={optimizationRunning}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {optimizationRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Otimizando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Otimizar Mix
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {Object.entries(scenarioData.segments).map(([key, segment], index) => (
                  <div key={key} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white capitalize">{key}</span>
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index] }} />
                    </div>
                    <div className="text-lg font-bold text-white">{segment.allocation}%</div>
                    <div className="text-sm text-slate-300">R$ {segment.rate}</div>
                    <div className="text-xs text-slate-400">Demanda: {segment.demand}%</div>
                  </div>
                ))}
              </div>

              {optimizationResults && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                      <h5 className="font-medium text-slate-300 mb-3">Mix Atual</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: 'Corporate', value: optimizationResults.current.corporate },
                              { name: 'Leisure', value: optimizationResults.current.leisure },
                              { name: 'Groups', value: optimizationResults.current.groups },
                              { name: 'Online', value: optimizationResults.current.online }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={index} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                      <h5 className="font-medium text-slate-300 mb-3">Mix Otimizado</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: 'Corporate', value: optimizationResults.optimized.corporate },
                              { name: 'Leisure', value: optimizationResults.optimized.leisure },
                              { name: 'Groups', value: optimizationResults.optimized.groups },
                              { name: 'Online', value: optimizationResults.optimized.online }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={index} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
                    <h4 className="text-lg font-semibold text-white mb-4">Impacto da Otimização</h4>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-1">
                          +R$ {optimizationResults.improvement.revenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-300">Aumento de Receita</div>
                        <div className="text-xs text-green-400 font-medium">
                          +{Math.round((optimizationResults.improvement.revenue / optimizationResults.current.revenue) * 100)}%
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                          +{optimizationResults.improvement.occupancy}%
                        </div>
                        <div className="text-sm text-slate-300">Aumento de Ocupação</div>
                        <div className="text-xs text-blue-400 font-medium">
                          {optimizationResults.current.occupancy}% → {optimizationResults.optimized.occupancy}%
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-1">
                          +R$ {optimizationResults.improvement.revpar}
                        </div>
                        <div className="text-sm text-slate-300">Aumento RevPAR</div>
                        <div className="text-xs text-purple-400 font-medium">
                          +{Math.round((optimizationResults.improvement.revpar / 222) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  FitoRev85 - RMS
                </h1>
                <p className="text-xs text-slate-400">{getCurrentProperty()?.name || 'Revenue Management System'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.nome}</p>
                <p className="text-xs text-slate-400">Revenue Manager</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="forecast" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardKPIs />
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <ManualForecast />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <RevenueAnalytics />
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <StrategicTools />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RMSForecastPace;
