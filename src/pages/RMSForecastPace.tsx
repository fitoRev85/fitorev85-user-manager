import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Eye, 
  Calendar, Users, DollarSign, Target, BarChart3,
  ArrowUp, ArrowDown, Minus, Bell, Star,
  MapPin, Trophy, Zap, Activity, ArrowLeft,
  ChevronLeft, ChevronRight, Edit3, Save, X, Percent,
  Clock, Filter, Download, RefreshCw, Brain, CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area, AreaChart, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Estados para Revenue Analytics
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [analyticsTab, setAnalyticsTab] = useState('seasonality');

  // Estados para Competitive Analysis
  const [selectedCompetitor, setSelectedCompetitor] = useState('all');
  const [forecastPeriod, setForecastPeriod] = useState(6);
  const [optimizationGoal, setOptimizationGoal] = useState('revenue');
  const [competitiveTab, setCompetitiveTab] = useState('competitive');

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

  // Revenue Analytics Data
  const seasonalityData = [
    { month: 'Jan', historical: 85, forecast: 88, year2023: 82, year2022: 87 },
    { month: 'Fev', historical: 78, forecast: 82, year2023: 75, year2022: 81 },
    { month: 'Mar', historical: 92, forecast: 95, year2023: 89, year2022: 95 },
    { month: 'Abr', historical: 88, forecast: 90, year2023: 86, year2022: 90 },
    { month: 'Mai', historical: 85, forecast: 87, year2023: 83, year2022: 87 },
    { month: 'Jun', historical: 95, forecast: 98, year2023: 92, year2022: 98 },
    { month: 'Jul', historical: 98, forecast: 100, year2023: 96, year2022: 100 },
    { month: 'Ago', historical: 96, forecast: 98, year2023: 94, year2022: 98 },
    { month: 'Set', historical: 90, forecast: 92, year2023: 88, year2022: 92 },
    { month: 'Out', historical: 93, forecast: 95, year2023: 91, year2022: 95 },
    { month: 'Nov', historical: 87, forecast: 89, year2023: 85, year2022: 89 },
    { month: 'Dez', historical: 91, forecast: 94, year2023: 89, year2022: 93 }
  ];

  const segmentData = [
    { segment: 'Corporate', occupancy: 75, adr: 280, revpar: 210, growth: 8.5, bookings: 1450 },
    { segment: 'Leisure', occupancy: 68, adr: 195, revpar: 133, growth: 12.3, bookings: 2850 },
    { segment: 'Grupos', occupancy: 85, adr: 165, revpar: 140, growth: -2.1, bookings: 890 },
    { segment: 'Online', occupancy: 72, adr: 220, revpar: 158, growth: 15.7, bookings: 3200 }
  ];

  const segmentPieData = [
    { name: 'Corporate', value: 35, color: '#0088FE' },
    { name: 'Leisure', value: 28, color: '#00C49F' },
    { name: 'Grupos', value: 15, color: '#FFBB28' },
    { name: 'Online', value: 22, color: '#FF8042' }
  ];

  const pickupData = [
    { days: '90+', current: 45, lastYear: 42, budget: 48 },
    { days: '60-89', current: 65, lastYear: 62, budget: 68 },
    { days: '30-59', current: 78, lastYear: 75, budget: 80 },
    { days: '15-29', current: 85, lastYear: 82, budget: 87 },
    { days: '7-14', current: 90, lastYear: 88, budget: 92 },
    { days: '0-6', current: 95, lastYear: 93, budget: 96 }
  ];

  const pickupTrendData = [
    { week: 'Sem 1', corporate: 25, leisure: 15, grupos: 35, online: 20 },
    { week: 'Sem 2', corporate: 35, leisure: 25, grupos: 45, online: 30 },
    { week: 'Sem 3', corporate: 45, leisure: 35, grupos: 55, online: 42 },
    { week: 'Sem 4', corporate: 55, leisure: 48, grupos: 65, online: 55 },
    { week: 'Sem 5', corporate: 65, leisure: 58, grupos: 72, online: 68 },
    { week: 'Sem 6', corporate: 72, leisure: 68, grupos: 78, online: 75 },
    { week: 'Sem 7', corporate: 78, leisure: 75, grupos: 82, online: 82 },
    { week: 'Sem 8', corporate: 85, leisure: 82, grupos: 88, online: 88 }
  ];

  // Competitive Analysis Data
  const competitiveData = [
    { month: 'Jan', ourCompany: 2400, competitor1: 2200, competitor2: 1800, competitor3: 2100, marketAverage: 2125 },
    { month: 'Fev', ourCompany: 2600, competitor1: 2300, competitor2: 1900, competitor3: 2200, marketAverage: 2250 },
    { month: 'Mar', ourCompany: 2800, competitor1: 2400, competitor2: 2000, competitor3: 2300, marketAverage: 2375 },
    { month: 'Abr', ourCompany: 3000, competitor1: 2500, competitor2: 2100, competitor3: 2400, marketAverage: 2500 },
    { month: 'Mai', ourCompany: 3200, competitor1: 2600, competitor2: 2200, competitor3: 2500, marketAverage: 2625 },
    { month: 'Jun', ourCompany: 3400, competitor1: 2700, competitor2: 2300, competitor3: 2600, marketAverage: 2750 }
  ];

  const businessMixData = [
    { segment: 'Produto A', revenue: 45, margin: 35, growth: 15, marketShare: 28 },
    { segment: 'Produto B', revenue: 30, margin: 42, growth: 8, marketShare: 22 },
    { segment: 'Produto C', revenue: 15, margin: 25, growth: 25, marketShare: 15 },
    { segment: 'Produto D', revenue: 10, margin: 18, growth: -5, marketShare: 12 }
  ];

  const competitorMetrics = {
    all: {
      marketShare: { us: 28, comp1: 25, comp2: 20, comp3: 22, others: 5 },
      nps: { us: 72, comp1: 68, comp2: 65, comp3: 70 },
      pricing: { us: 100, comp1: 95, comp2: 88, comp3: 102 },
      innovation: { us: 85, comp1: 78, comp2: 72, comp3: 80 }
    }
  };

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

  // Competitive Analysis Functions
  const generateForecast = (historicalData, periods) => {
    const values = historicalData.map(d => d.ourCompany);
    const trend = (values[values.length - 1] - values[0]) / (values.length - 1);
    const seasonality = values.map((v, i) => v - (values[0] + trend * i));
    const avgSeasonality = seasonality.reduce((a, b) => a + b, 0) / seasonality.length;
    
    const forecast = [];
    for (let i = 1; i <= periods; i++) {
      const baseValue = values[values.length - 1] + trend * i;
      const seasonal = avgSeasonality * Math.sin((i * Math.PI) / 6);
      const noise = (Math.random() - 0.5) * 100;
      
      forecast.push({
        month: `Mês ${i}`,
        predicted: Math.max(0, baseValue + seasonal + noise),
        confidence: 85 + Math.random() * 10,
        lower: Math.max(0, baseValue + seasonal - 200),
        upper: baseValue + seasonal + 200
      });
    }
    return forecast;
  };

  const competitiveForecastData = useMemo(() => 
    generateForecast(competitiveData, forecastPeriod), 
    [forecastPeriod]
  );

  const optimizePortfolio = (data, goal) => {
    let optimized = [...data];
    
    switch (goal) {
      case 'revenue':
        optimized = optimized.map(item => ({
          ...item,
          recommended: item.revenue * 1.2 + item.growth * 0.5
        }));
        break;
      case 'margin':
        optimized = optimized.map(item => ({
          ...item,
          recommended: item.margin * 1.5 + item.revenue * 0.3
        }));
        break;
      case 'growth':
        optimized = optimized.map(item => ({
          ...item,
          recommended: item.growth * 2 + item.marketShare * 0.5
        }));
        break;
      default:
        optimized = optimized.map(item => ({
          ...item,
          recommended: (item.revenue + item.margin + item.growth) / 3
        }));
    }
    
    return optimized.sort((a, b) => b.recommended - a.recommended);
  };

  const optimizedMix = useMemo(() => 
    optimizePortfolio(businessMixData, optimizationGoal), 
    [optimizationGoal]
  );

  const radarData = [
    {
      metric: 'Market Share',
      us: competitorMetrics.all.marketShare.us,
      competitor1: competitorMetrics.all.marketShare.comp1,
      competitor2: competitorMetrics.all.marketShare.comp2,
      competitor3: competitorMetrics.all.marketShare.comp3
    },
    {
      metric: 'NPS',
      us: competitorMetrics.all.nps.us,
      competitor1: competitorMetrics.all.nps.comp1,
      competitor2: competitorMetrics.all.nps.comp2,
      competitor3: competitorMetrics.all.nps.comp3
    },
    {
      metric: 'Pricing Index',
      us: competitorMetrics.all.pricing.us,
      competitor1: competitorMetrics.all.pricing.comp1,
      competitor2: competitorMetrics.all.pricing.comp2,
      competitor3: competitorMetrics.all.pricing.comp3
    },
    {
      metric: 'Innovation Score',
      us: competitorMetrics.all.innovation.us,
      competitor1: competitorMetrics.all.innovation.comp1,
      competitor2: competitorMetrics.all.innovation.comp2,
      competitor3: competitorMetrics.all.innovation.comp3
    }
  ];

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

  // Revenue Analytics Render Functions
  const renderSeasonalityTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Índice Sazonal Atual</h3>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">92.5</div>
          <div className="text-xs text-slate-400 mt-1">Alta temporada detectada</div>
          <div className="text-xs text-green-400 mt-1">+5.2% vs ano anterior</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-green-400" />
            <h3 className="text-sm font-medium text-white">Previsão Próximo Mês</h3>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">95.2</div>
          <div className="text-xs text-slate-400 mt-1">Pico sazonal esperado</div>
          <div className="text-xs text-blue-400 mt-1">Confiança: 87%</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-medium text-white">Variação Anual</h3>
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">±12.8%</div>
          <div className="text-xs text-slate-400 mt-1">Amplitude sazonal</div>
          <div className="text-xs text-orange-400 mt-1">Padrão estável</div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Análise de Sazonalidade - Padrões Históricos</h3>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="12months">12 Meses</option>
            <option value="24months">24 Meses</option>
            <option value="36months">36 Meses</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={seasonalityData}>
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
            <Legend />
            <Area type="monotone" dataKey="historical" fill="#8884d8" fillOpacity={0.3} />
            <Line type="monotone" dataKey="forecast" stroke="#ff7300" strokeWidth={3} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="year2023" stroke="#82ca9d" strokeWidth={2} />
            <Line type="monotone" dataKey="year2022" stroke="#8884d8" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Insights Sazonais</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <div className="text-sm font-medium text-blue-300">Alta Temporada</div>
              <div className="text-xs text-blue-400 mt-1">Jun-Ago: +18% ocupação média</div>
            </div>
            <div className="p-3 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
              <div className="text-sm font-medium text-yellow-300">Temporada Média</div>
              <div className="text-xs text-yellow-400 mt-1">Mar-Mai, Set-Nov: Ocupação estável</div>
            </div>
            <div className="p-3 bg-red-600/20 rounded-lg border border-red-500/30">
              <div className="text-sm font-medium text-red-300">Baixa Temporada</div>
              <div className="text-xs text-red-400 mt-1">Dez-Fev: -12% ocupação média</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recomendações Estratégicas</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-white">Otimizar Preços Alta Temporada</div>
                <div className="text-xs text-slate-400">Aumentar ADR em 8-12% nos picos</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-white">Campanhas Baixa Temporada</div>
                <div className="text-xs text-slate-400">Promoções direcionadas Dez-Fev</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-white">Gestão de Inventory</div>
                <div className="text-xs text-slate-400">Ajustar restrições por sazonalidade</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSegmentationTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {segmentData.map((segment, index) => (
          <div 
            key={segment.segment} 
            className={`bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 cursor-pointer transition-all ${
              selectedSegment === segment.segment.toLowerCase() ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedSegment(segment.segment.toLowerCase())}
          >
            <h3 className="text-sm font-medium text-white mb-4">{segment.segment}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Ocupação</span>
                <span className="text-sm font-bold text-white">{segment.occupancy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">ADR</span>
                <span className="text-sm font-bold text-white">R$ {segment.adr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">RevPAR</span>
                <span className="text-sm font-bold text-white">R$ {segment.revpar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Crescimento</span>
                <span className={`text-sm font-bold ${segment.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {segment.growth > 0 ? '+' : ''}{segment.growth}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Performance por Segmento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="segment" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Legend />
              <Bar dataKey="occupancy" fill="#8884d8" name="Ocupação %" />
              <Bar dataKey="revpar" fill="#82ca9d" name="RevPAR" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Distribuição de Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {segmentPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">Análise Detalhada por Segmento</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-blue-400">Corporate</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Booking Window:</span>
                <span className="font-medium text-white">45 dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stay Duration:</span>
                <span className="font-medium text-white">2.1 noites</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cancelation Rate:</span>
                <span className="font-medium text-white">8.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Repeat Rate:</span>
                <span className="font-medium text-white">68%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-green-400">Leisure</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Booking Window:</span>
                <span className="font-medium text-white">28 dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stay Duration:</span>
                <span className="font-medium text-white">3.8 noites</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cancelation Rate:</span>
                <span className="font-medium text-white">12.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Repeat Rate:</span>
                <span className="font-medium text-white">35%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-purple-400">Online</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Booking Window:</span>
                <span className="font-medium text-white">12 dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stay Duration:</span>
                <span className="font-medium text-white">2.9 noites</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cancelation Rate:</span>
                <span className="font-medium text-white">15.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Repeat Rate:</span>
                <span className="font-medium text-white">22%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPickupTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Pickup Atual (30 dias)</h3>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">78%</div>
          <div className="text-xs text-slate-400 mt-1">vs 75% ano anterior</div>
          <div className="text-xs text-green-400 mt-1">+4.0% acima do budget</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="text-sm font-medium text-white">Velocidade de Reservas</h3>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">+12.5%</div>
          <div className="text-xs text-slate-400 mt-1">vs período similar</div>
          <div className="text-xs text-blue-400 mt-1">Tendência acelerada</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-medium text-white">Projeção Final</h3>
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">94%</div>
          <div className="text-xs text-slate-400 mt-1">Ocupação esperada</div>
          <div className="text-xs text-orange-400 mt-1">Confiança: 91%</div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">Curva de Pick-up por Antecedência</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={pickupData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="days" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Legend />
            <Bar dataKey="current" fill="#8884d8" name="Atual" />
            <Bar dataKey="lastYear" fill="#82ca9d" name="Ano Anterior" />
            <Bar dataKey="budget" fill="#ffc658" name="Budget" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">Evolução Semanal do Pick-up por Segmento</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={pickupTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="week" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="corporate" stackId="1" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="leisure" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            <Area type="monotone" dataKey="grupos" stackId="1" stroke="#ffc658" fill="#ffc658" />
            <Area type="monotone" dataKey="online" stackId="1" stroke="#ff7300" fill="#ff7300" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Padrões de Reserva</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <div className="text-sm font-medium text-blue-300">Early Bookers (90+ dias)</div>
              <div className="text-xs text-blue-400 mt-1">Principalmente Corporate e Grupos</div>
              <div className="text-xs text-slate-400">ADR Premium: +15%</div>
            </div>
            <div className="p-3 bg-green-600/20 rounded-lg border border-green-500/30">
              <div className="text-sm font-medium text-green-300">Advance Bookers (30-89 dias)</div>
              <div className="text-xs text-green-400 mt-1">Mix equilibrado de segmentos</div>
              <div className="text-xs text-slate-400">ADR Padrão: base</div>
            </div>
            <div className="p-3 bg-orange-600/20 rounded-lg border border-orange-500/30">
              <div className="text-sm font-medium text-orange-300">Last Minute (0-29 dias)</div>
              <div className="text-xs text-orange-400 mt-1">Leisure e Online dominantes</div>
              <div className="text-xs text-slate-400">ADR Promocional: -8%</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Alertas e Oportunidades</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-white">Pickup Slow - Grupos</div>
                <div className="text-xs text-slate-400">-15% vs ano anterior nos próximos 60 dias</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-white">Corporate Accelerated</div>
                <div className="text-xs text-slate-400">+22% booking pace vs budget</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-white">Online Opportunity</div>
                <div className="text-xs text-slate-400">Potencial para aumentar ADR em 5%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Competitive Analysis Render Functions
  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className={`text-2xl font-bold text-${color}-400 mt-1`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 text-${color}-400`} />
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          {change > 0 ? (
            <ArrowUp className="h-4 w-4 text-green-400 mr-1" />
          ) : change < 0 ? (
            <ArrowDown className="h-4 w-4 text-red-400 mr-1" />
          ) : (
            <Minus className="h-4 w-4 text-slate-400 mr-1" />
          )}
          <span className={`text-sm font-medium ${
            change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-slate-400'
          }`}>
            {Math.abs(change)}% vs mês anterior
          </span>
        </div>
      )}
    </div>
  );

  const CompetitiveAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Market Share"
          value="28.5%"
          change={2.3}
          icon={Target}
          color="blue"
        />
        <MetricCard
          title="NPS Score"
          value="72"
          change={4}
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Pricing Index"
          value="100"
          change={-1.2}
          icon={DollarSign}
          color="purple"
        />
        <MetricCard
          title="Innovation Score"
          value="85"
          change={3.5}
          icon={Brain}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance vs Competidores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={competitiveData}>
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
              <Legend />
              <Line type="monotone" dataKey="ourCompany" stroke="#3B82F6" strokeWidth={3} name="Nossa Empresa" />
              <Line type="monotone" dataKey="competitor1" stroke="#EF4444" strokeWidth={2} name="Concorrente 1" />
              <Line type="monotone" dataKey="competitor2" stroke="#F59E0B" strokeWidth={2} name="Concorrente 2" />
              <Line type="monotone" dataKey="competitor3" stroke="#10B981" strokeWidth={2} name="Concorrente 3" />
              <Line type="monotone" dataKey="marketAverage" stroke="#6B7280" strokeDasharray="5 5" name="Média do Mercado" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Radar Competitivo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar name="Nossa Empresa" dataKey="us" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Concorrente 1" dataKey="competitor1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} />
              <Radar name="Concorrente 2" dataKey="competitor2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} />
              <Radar name="Concorrente 3" dataKey="competitor3" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Market Share Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(competitorMetrics.all.marketShare).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-blue-400">{value}%</div>
              <div className="text-sm text-slate-400 capitalize">
                {key === 'us' ? 'Nossa Empresa' : key === 'others' ? 'Outros' : `Concorrente ${key.slice(-1)}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DisplacementAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Otimização de Mix de Negócios</h2>
        <select
          value={optimizationGoal}
          onChange={(e) => setOptimizationGoal(e.target.value)}
          className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="revenue">Maximizar Receita</option>
          <option value="margin">Maximizar Margem</option>
          <option value="growth">Maximizar Crescimento</option>
          <option value="balanced">Abordagem Balanceada</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Mix Atual vs Otimizado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={optimizedMix}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="segment" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" name="Receita Atual (%)" />
              <Bar dataKey="recommended" fill="#10B981" name="Recomendado" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Análise de Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={businessMixData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="marketShare" name="Market Share" stroke="#94a3b8" />
              <YAxis dataKey="growth" name="Crescimento" stroke="#94a3b8" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Scatter name="Produtos" dataKey="margin" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recomendações de Otimização</h3>
        <div className="space-y-4">
          {optimizedMix.map((item, index) => (
            <div key={item.segment} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-green-400' : index === 1 ? 'bg-blue-400' : index === 2 ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <div>
                  <div className="font-medium text-white">{item.segment}</div>
                  <div className="text-sm text-slate-400">
                    Receita: {item.revenue}% | Margem: {item.margin}% | Crescimento: {item.growth}%
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">Prioridade #{index + 1}</div>
                <div className="text-sm text-slate-400">Score: {item.recommended.toFixed(1)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ForecastingAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Forecasting Automático com ML</h2>
        <select
          value={forecastPeriod}
          onChange={(e) => setForecastPeriod(parseInt(e.target.value))}
          className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={3}>3 meses</option>
          <option value={6}>6 meses</option>
          <option value={12}>12 meses</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Precisão do Modelo"
          value="87.3%"
          change={2.1}
          icon={Brain}
          color="green"
        />
        <MetricCard
          title="Confiança Média"
          value="89.2%"
          change={1.5}
          icon={CheckCircle}
          color="blue"
        />
        <MetricCard
          title="Tendência Prevista"
          value="+12.4%"
          change={3.2}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Previsão de Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={[...competitiveData, ...competitiveForecastData]}>
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
            <Legend />
            <Area 
              dataKey="upper" 
              stackId="confidence" 
              stroke="none" 
              fill="#3B82F6" 
              fillOpacity={0.1} 
              name="Intervalo de Confiança"
            />
            <Area 
              dataKey="lower" 
              stackId="confidence" 
              stroke="none" 
              fill="#ffffff" 
              fillOpacity={1}
            />
            <Line 
              type="monotone" 
              dataKey="ourCompany" 
              stroke="#3B82F6" 
              strokeWidth={3} 
              name="Histórico"
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#10B981" 
              strokeWidth={3} 
              strokeDasharray="5 5"
              name="Previsão ML"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Fatores de Influência</h3>
          <div className="space-y-3">
            {[
              { factor: 'Sazonalidade', impact: 85, trend: 'up' },
              { factor: 'Tendência de Mercado', impact: 78, trend: 'up' },
              { factor: 'Ações Competitivas', impact: 65, trend: 'down' },
              { factor: 'Fatores Externos', impact: 45, trend: 'neutral' }
            ].map((item) => (
              <div key={item.factor} className="flex items-center justify-between">
                <span className="text-slate-300">{item.factor}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{ width: `${item.impact}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-400 w-8">{item.impact}%</span>
                  {item.trend === 'up' && <ArrowUp className="h-4 w-4 text-green-400" />}
                  {item.trend === 'down' && <ArrowDown className="h-4 w-4 text-red-400" />}
                  {item.trend === 'neutral' && <Minus className="h-4 w-4 text-slate-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cenários de Previsão</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-600/20 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-300">Cenário Otimista</span>
                <span className="text-green-400 font-bold">+18.5%</span>
              </div>
              <div className="text-sm text-green-400">
                Crescimento acelerado com expansão de mercado
              </div>
            </div>
            
            <div className="p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-300">Cenário Base</span>
                <span className="text-blue-400 font-bold">+12.4%</span>
              </div>
              <div className="text-sm text-blue-400">
                Crescimento sustentável seguindo tendências atuais
              </div>
            </div>
            
            <div className="p-4 bg-orange-600/20 rounded-lg border border-orange-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-orange-300">Cenário Conservador</span>
                <span className="text-orange-400 font-bold">+7.2%</span>
              </div>
              <div className="text-sm text-orange-400">
                Crescimento moderado com desafios de mercado
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
              <p className="text-slate-400">Sistema Completo de Gestão de Revenue</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg w-fit">
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
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
          >
            Revenue Analytics
          </button>
          <button
            onClick={() => setActiveTab('competitive')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'competitive' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
          >
            Análise Competitiva
          </button>
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

        {activeTab === 'analytics' && (
          <>
            <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg w-fit">
              <button
                onClick={() => setAnalyticsTab('seasonality')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${analyticsTab === 'seasonality' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                Análise de Sazonalidade
              </button>
              <button
                onClick={() => setAnalyticsTab('segmentation')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${analyticsTab === 'segmentation' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                Segmentação de Demanda
              </button>
              <button
                onClick={() => setAnalyticsTab('pickup')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${analyticsTab === 'pickup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                Pick-up Analysis
              </button>
            </div>

            {analyticsTab === 'seasonality' && renderSeasonalityTab()}
            {analyticsTab === 'segmentation' && renderSegmentationTab()}
            {analyticsTab === 'pickup' && renderPickupTab()}
          </>
        )}

        {activeTab === 'competitive' && (
          <>
            <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg w-fit">
              <button
                onClick={() => setCompetitiveTab('competitive')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${competitiveTab === 'competitive' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                Análise Competitiva
              </button>
              <button
                onClick={() => setCompetitiveTab('displacement')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${competitiveTab === 'displacement' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                Displacement Analysis
              </button>
              <button
                onClick={() => setCompetitiveTab('forecasting')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${competitiveTab === 'forecasting' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                Forecasting ML
              </button>
            </div>

            {competitiveTab === 'competitive' && <CompetitiveAnalysis />}
            {competitiveTab === 'displacement' && <DisplacementAnalysis />}
            {competitiveTab === 'forecasting' && <ForecastingAnalysis />}
          </>
        )}
      </div>
    </div>
  );
};

export default RMSForecastPace;
