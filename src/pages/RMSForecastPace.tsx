
import React, { useState, useEffect } from 'react';
import { 
  Calendar, TrendingUp, Target, BarChart3, DollarSign, Users, Percent, Edit3, Save, X, 
  ChevronLeft, ChevronRight, Eye, ArrowLeft, Building2, LogOut, FileText, 
  Calculator, Package, Settings, AlertTriangle, Plus, Minus, RefreshCw,
  ArrowUp, ArrowDown, PieChart, Download, CheckCircle, Clock, AlertCircle, Bed, 
  PlayCircle, Edit, Trash2, Play, Zap, RotateCcw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, ScatterChart, Scatter
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            
            <div className="flex items-end">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <div className="text-sm text-blue-300 font-medium">{property.name}</div>
                <div className="text-xs text-blue-400">{property.uh} UH • {property.city}</div>
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
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Forecast:</span>
                <span className="font-semibold text-blue-400">{currentMonthData.occupancyForecast}%</span>
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
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Forecast:</span>
                <span className="font-semibold text-green-400">R$ {currentMonthData.dailyRateForecast}</span>
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

  // Placeholder components for other tabs
  const PlaceholderTab = ({ title, description }) => (
    <div className="text-center text-white p-8">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );

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
            <PlaceholderTab 
              title="Revenue Analytics" 
              description="Análises detalhadas de sazonalidade, segmentação e pick-up" 
            />
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <PlaceholderTab 
              title="Strategic Tools" 
              description="Ferramentas estratégicas e otimização de receita" 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RMSForecastPace;
