
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Eye, 
  Calendar, Users, DollarSign, Target, BarChart3,
  ArrowUp, ArrowDown, Minus, Bell, Star,
  MapPin, Trophy, Zap, Activity, ArrowLeft,
  ChevronLeft, ChevronRight, Edit3, Save, X, Percent
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const RMSForecastPace = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [alerts, setAlerts] = useState([]);
  
  // Estados para o forecast manual
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingForecast, setEditingForecast] = useState(null);
  const [forecastData, setForecastData] = useState({});
  const [paceData, setPaceData] = useState({});

  // Propriedades simuladas
  const properties = [
    { id: '1', name: 'Grand Hotel Luxo', category: 'Luxo', uh: 120, city: 'São Paulo', score: 95, revpar: 145.20, trend: 'up' },
    { id: '2', name: 'Boutique Charm', category: 'Boutique', uh: 45, city: 'Rio de Janeiro', score: 88, revpar: 132.50, trend: 'up' },
    { id: '3', name: 'Resort Paradise', category: 'Resort', uh: 200, city: 'Florianópolis', score: 82, revpar: 118.90, trend: 'down' },
    { id: '4', name: 'Business Center', category: 'Corporativo', uh: 80, city: 'Brasília', score: 78, revpar: 95.75, trend: 'stable' }
  ];

  // Dados simulados para KPIs
  const kpiData = {
    revpar: { current: 125.50, forecast: 118.20, lastYear: 98.75, target: 130.00 },
    adr: { current: 180.25, forecast: 175.80, lastYear: 165.40, target: 185.00 },
    occupancy: { current: 69.6, forecast: 67.2, lastYear: 59.7, target: 75.0 },
    goppar: { current: 48.75, forecast: 45.20, lastYear: 38.90, target: 52.00 },
    trevpar: { current: 156.80, forecast: 148.90, lastYear: 125.30, target: 165.00 },
    marketShare: { current: 12.8, forecast: 12.2, lastYear: 11.5, target: 14.0 }
  };

  const monthlyTrends = [
    { month: 'Jan', revpar: 98, adr: 165, occupancy: 59 },
    { month: 'Feb', revpar: 105, adr: 168, occupancy: 62 },
    { month: 'Mar', revpar: 118, adr: 172, occupancy: 68 },
    { month: 'Apr', revpar: 125, adr: 180, occupancy: 69 },
    { month: 'Mai', revpar: 126, adr: 180, occupancy: 70 }
  ];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Inicializar dados de forecast
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
    const newAlerts = [];
    if (kpiData.occupancy.current < kpiData.occupancy.forecast * 0.95) {
      newAlerts.push({
        id: 1,
        type: 'warning',
        message: 'Ocupação abaixo do forecast em 3.4%',
        severity: 'medium'
      });
    }
    if (kpiData.revpar.current > kpiData.revpar.forecast * 1.05) {
      newAlerts.push({
        id: 2,
        type: 'success',
        message: 'RevPAR superou forecast em 6.2%',
        severity: 'low'
      });
    }
    setAlerts(newAlerts);
  }, []);

  const getTrendIcon = (current, comparison) => {
    const diff = ((current - comparison) / comparison) * 100;
    if (diff > 2) return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (diff < -2) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  const getTrendColor = (current, comparison) => {
    const diff = ((current - comparison) / comparison) * 100;
    if (diff > 2) return 'text-green-400';
    if (diff < -2) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getPerformanceColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 95) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCurrentProperty = () => properties.find(p => p.id === selectedProperty) || properties[0];
  
  const getCurrentMonthData = () => {
    const propId = selectedProperty === 'all' ? '1' : selectedProperty;
    if (!forecastData[propId] || !forecastData[propId][selectedYear]) {
      return null;
    }
    return forecastData[propId][selectedYear][selectedMonth];
  };

  const getCurrentPaceData = () => {
    const propId = selectedProperty === 'all' ? '1' : selectedProperty;
    if (!paceData[propId] || !paceData[propId][selectedYear]) {
      return null;
    }
    return paceData[propId][selectedYear][selectedMonth];
  };

  const handleForecastEdit = (field, value) => {
    const propId = selectedProperty === 'all' ? '1' : selectedProperty;
    const newData = { ...forecastData };
    if (!newData[propId]) newData[propId] = {};
    if (!newData[propId][selectedYear]) newData[propId][selectedYear] = {};
    if (!newData[propId][selectedYear][selectedMonth]) {
      newData[propId][selectedYear][selectedMonth] = {};
    }
    
    newData[propId][selectedYear][selectedMonth][field] = parseInt(value) || 0;
    
    const monthData = newData[propId][selectedYear][selectedMonth];
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
    if (!newPaceData[propId]) newPaceData[propId] = {};
    if (!newPaceData[propId][selectedYear]) newPaceData[propId][selectedYear] = {};
    if (!newPaceData[propId][selectedYear][selectedMonth]) {
      newPaceData[propId][selectedYear][selectedMonth] = {};
    }
    
    const currentPace = newPaceData[propId][selectedYear][selectedMonth];
    currentPace.bookingsPace = (monthData.bookingsToDate || 0) / ((monthData.occupancyForecast || 1) / 100 * property.uh) * 100;
    currentPace.revenuePace = (monthData.revenueActual || 0) / (monthData.revenueForecast || 1) * 100;
    currentPace.occupancyPace = (monthData.occupancyActual || 0) / (monthData.occupancyForecast || 1) * 100;
    
    setPaceData(newPaceData);
  };

  const generateChartData = () => {
    const data = [];
    const propId = selectedProperty === 'all' ? '1' : selectedProperty;
    for (let month = 0; month < 12; month++) {
      const monthData = forecastData[propId]?.[selectedYear]?.[month];
      const paceMonthData = paceData[propId]?.[selectedYear]?.[month];
      
      if (monthData) {
        data.push({
          month: monthNames[month].substring(0, 3),
          forecast: monthData.occupancyForecast || 0,
          actual: monthData.occupancyActual || 0,
          lastYear: monthData.lastYearOccupancy || 0,
          pace: paceMonthData?.occupancyPace || 0
        });
      }
    }
    return data;
  };

  const generateRevenueChartData = () => {
    const data = [];
    const propId = selectedProperty === 'all' ? '1' : selectedProperty;
    for (let month = 0; month < 12; month++) {
      const monthData = forecastData[propId]?.[selectedYear]?.[month];
      
      if (monthData) {
        data.push({
          month: monthNames[month].substring(0, 3),
          forecast: monthData.revenueForecast || 0,
          actual: monthData.revenueActual || 0,
          lastYear: monthData.lastYearRevenue || 0
        });
      }
    }
    return data;
  };

  const KPIWidget = ({ title, icon, data, unit = '', isPercentage = false }) => {
    const formatValue = (value) => {
      if (isPercentage) return `${value.toFixed(1)}%`;
      return unit ? `${unit}${value.toFixed(2)}` : value.toFixed(2);
    };

    const forecastDiff = ((data.current - data.forecast) / data.forecast) * 100;
    const yearDiff = ((data.current - data.lastYear) / data.lastYear) * 100;
    const targetProgress = (data.current / data.target) * 100;

    return (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              {icon}
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          <div className="flex gap-1">
            {getTrendIcon(data.current, data.forecast)}
            {getTrendIcon(data.current, data.lastYear)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {formatValue(data.current)}
            </div>
            <div className="text-sm text-slate-400">Atual</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className={`font-semibold ${getTrendColor(data.current, data.forecast)}`}>
                {forecastDiff > 0 ? '+' : ''}{forecastDiff.toFixed(1)}%
              </div>
              <div className="text-slate-400">vs Forecast</div>
              <div className="text-slate-500">{formatValue(data.forecast)}</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${getTrendColor(data.current, data.lastYear)}`}>
                {yearDiff > 0 ? '+' : ''}{yearDiff.toFixed(1)}%
              </div>
              <div className="text-slate-400">vs Ano Ant.</div>
              <div className="text-slate-500">{formatValue(data.lastYear)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Meta: {formatValue(data.target)}</span>
              <span className="font-semibold text-white">{targetProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getPerformanceColor(data.current, data.target)}`}
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AlertsPanel = () => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-orange-400" />
        <h3 className="font-semibold text-white">Alertas Inteligentes</h3>
        <span className="bg-orange-600/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
          {alerts.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {alerts.length > 0 ? alerts.map(alert => (
          <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
            alert.type === 'warning' ? 'bg-yellow-600/20 border-yellow-400' : 'bg-green-600/20 border-green-400'
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${
                alert.type === 'warning' ? 'text-yellow-400' : 'text-green-400'
              }`} />
              <span className="text-sm font-medium text-white">{alert.message}</span>
            </div>
          </div>
        )) : (
          <div className="text-center py-4 text-slate-400">
            <Zap className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">Nenhum alerta no momento</p>
          </div>
        )}
      </div>
    </div>
  );

  const PropertyScorecard = () => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="font-semibold text-white">Ranking de Propriedades</h3>
      </div>
      
      <div className="space-y-3">
        {properties.map((property, index) => (
          <div key={property.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-600/20 text-yellow-400' :
                index === 1 ? 'bg-slate-600/20 text-slate-400' :
                index === 2 ? 'bg-orange-600/20 text-orange-400' : 'bg-blue-600/20 text-blue-400'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-white">{property.name}</div>
                <div className="text-sm text-slate-400">R$ {property.revpar.toFixed(2)} RevPAR</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-semibold text-white">{property.score}</div>
                <div className="text-xs text-slate-400">Score</div>
              </div>
              {property.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
              {property.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
              {property.trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TrendChart = () => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Tendências Mensais</h3>
        </div>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="text-sm bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="monthly">Mensal</option>
          <option value="weekly">Semanal</option>
          <option value="daily">Diário</option>
        </select>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Line type="monotone" dataKey="revpar" stroke="#3B82F6" strokeWidth={3} name="RevPAR" />
            <Line type="monotone" dataKey="adr" stroke="#10B981" strokeWidth={3} name="ADR" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const HeatmapPerformance = () => {
    const heatmapData = [
      ['Janeiro', 85, 92, 78, 88],
      ['Fevereiro', 88, 94, 82, 85],
      ['Março', 92, 96, 85, 90],
      ['Abril', 95, 98, 88, 87],
      ['Maio', 93, 95, 86, 89]
    ];

    const getHeatColor = (value) => {
      if (value >= 95) return 'bg-green-500';
      if (value >= 90) return 'bg-green-400';
      if (value >= 85) return 'bg-yellow-400';
      if (value >= 80) return 'bg-orange-400';
      return 'bg-red-400';
    };

    return (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Mapa de Calor - Performance</h3>
        </div>
        
        <div className="grid grid-cols-5 gap-1 text-xs">
          <div></div>
          {properties.slice(0, 4).map(property => (
            <div key={property.id} className="text-center font-medium text-slate-300 p-2">
              {property.name.split(' ')[0]}
            </div>
          ))}
          
          {heatmapData.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <div className="text-right font-medium text-slate-300 p-2">
                {row[0]}
              </div>
              {row.slice(1).map((value, colIndex) => (
                <div
                  key={colIndex}
                  className={`${getHeatColor(value)} rounded p-2 text-white text-center font-medium flex items-center justify-center h-12`}
                >
                  {value}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-4 text-xs">
          <span className="text-slate-400">Baixo</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <div className="w-4 h-4 bg-green-500 rounded"></div>
          </div>
          <span className="text-slate-400">Alto</span>
        </div>
      </div>
    );
  };

  const currentMonthData = getCurrentMonthData();
  const currentPaceData = getCurrentPaceData();
  const property = getCurrentProperty();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Revenue Management System</h1>
              <p className="text-slate-400">Dashboard KPIs & Forecast Manual</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              Dashboard KPIs
            </button>
            <button
              onClick={() => setActiveTab('forecast')}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'forecast' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              Forecast Manual
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Controles do Dashboard */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <select 
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas as Propriedades</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Maio 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <KPIWidget 
                title="RevPAR" 
                icon={<DollarSign className="w-5 h-5 text-blue-400" />}
                data={kpiData.revpar}
                unit="R$ "
              />
              <KPIWidget 
                title="ADR" 
                icon={<Target className="w-5 h-5 text-green-400" />}
                data={kpiData.adr}
                unit="R$ "
              />
              <KPIWidget 
                title="Ocupação" 
                icon={<Users className="w-5 h-5 text-purple-400" />}
                data={kpiData.occupancy}
                isPercentage={true}
              />
              <KPIWidget 
                title="GOPPAR" 
                icon={<BarChart3 className="w-5 h-5 text-orange-400" />}
                data={kpiData.goppar}
                unit="R$ "
              />
              <KPIWidget 
                title="TRevPAR" 
                icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
                data={kpiData.trevpar}
                unit="R$ "
              />
              <KPIWidget 
                title="Market Share" 
                icon={<Eye className="w-5 h-5 text-red-400" />}
                data={kpiData.marketShare}
                isPercentage={true}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart />
              <HeatmapPerformance />
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PropertyScorecard />
              <AlertsPanel />
            </div>
          </>
        )}

        {activeTab === 'forecast' && currentMonthData && property && (
          <>
            {/* Controles de Forecast */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Propriedade</label>
                  <select 
                    value={selectedProperty === 'all' ? '1' : selectedProperty} 
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
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
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mês</label>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedMonth(selectedMonth > 0 ? selectedMonth - 1 : 11)}
                      className="p-2 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => setSelectedMonth(selectedMonth < 11 ? selectedMonth + 1 : 0)}
                      className="p-2 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-end">
                  <div className="bg-blue-600/20 border border-blue-500/30 p-3 rounded-lg w-full">
                    <div className="text-sm text-blue-300 font-medium">{property.name}</div>
                    <div className="text-xs text-blue-400">{property.uh} UH • {property.city}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPIs do Mês Atual para Forecast */}
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

            {/* Gráficos de Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ocupação: Forecast vs Atual vs Ano Anterior</h3>
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
                        color: '#ffffff'
                      }}
                    />
                    <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} name="Forecast" />
                    <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Atual" />
                    <Line type="monotone" dataKey="lastYear" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" name="Ano Anterior" />
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
                      formatter={(value) => [`R$ ${value.toLocaleString()}`, '']}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                    />
                    <Bar dataKey="forecast" fill="#8B5CF6" name="Forecast" />
                    <Bar dataKey="actual" fill="#10B981" name="Atual" />
                    <Bar dataKey="lastYear" fill="#6B7280" name="Ano Anterior" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pace Analysis */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Análise de Pace - {monthNames[selectedMonth]} {selectedYear}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{currentPaceData.occupancyPace.toFixed(1)}%</div>
                  <div className="text-sm text-slate-300">Pace de Ocupação</div>
                  <div className={`text-xs mt-1 ${currentPaceData.occupancyPace >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                    {currentPaceData.occupancyPace >= 100 ? 'Acima do forecast' : 'Abaixo do forecast'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{currentPaceData.revenuePace.toFixed(1)}%</div>
                  <div className="text-sm text-slate-300">Pace de Receita</div>
                  <div className={`text-xs mt-1 ${currentPaceData.revenuePace >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                    {currentPaceData.revenuePace >= 100 ? 'Acima do forecast' : 'Abaixo do forecast'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{currentPaceData.bookingsPace.toFixed(1)}%</div>
                  <div className="text-sm text-slate-300">Pace de Reservas</div>
                  <div className={`text-xs mt-1 ${currentPaceData.bookingsPace >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                    {currentPaceData.bookingsPace >= 100 ? 'Acima do forecast' : 'Abaixo do forecast'}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RMSForecastPace;
