import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, TrendingUp, Target, BarChart3, DollarSign, Users, Percent, Edit3, Save, X, 
  ChevronLeft, ChevronRight, Eye, ArrowLeft, Building2, LogOut, FileText, 
  Calculator, Package, Settings, AlertTriangle, ChevronDown, ChevronUp, Plus, Minus, RefreshCw,
  ArrowUp, ArrowDown, PieChart, Download, Brain, CheckCircle, Clock, AlertCircle, Bed, PlayCircle, Edit, Trash2,
  Play, RotateCcw, Zap
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, 
  ComposedChart, Area, AreaChart, PieChart as RechartsPieChart, Pie, Cell, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RMSForecastPace = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProperty, setSelectedProperty] = useState('1');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingForecast, setEditingForecast] = useState(null);
  const [forecastData, setForecastData] = useState({});
  const [paceData, setPaceData] = useState({});

  const properties = [
    { id: '1', name: 'Grand Hotel Luxo', category: 'Luxo', uh: 120, city: 'São Paulo' },
    { id: '2', name: 'Boutique Charm', category: 'Boutique', uh: 45, city: 'Rio de Janeiro' },
    { id: '3', name: 'Resort Paradise', category: 'Resort', uh: 200, city: 'Florianópolis' },
    { id: '4', name: 'Business Center', category: 'Corporativo', uh: 80, city: 'Brasília' }
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

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getCurrentProperty = () => properties.find(p => p.id === selectedProperty);
  
  const getCurrentMonthData = () => {
    if (!forecastData[selectedProperty] || !forecastData[selectedProperty][selectedYear]) {
      return null;
    }
    return forecastData[selectedProperty][selectedYear][selectedMonth];
  };

  const getCurrentPaceData = () => {
    if (!paceData[selectedProperty] || !paceData[selectedProperty][selectedYear]) {
      return null;
    }
    return paceData[selectedProperty][selectedYear][selectedMonth];
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
    for (let month = 0; month < 12; month++) {
      const monthData = forecastData[selectedProperty]?.[selectedYear]?.[month];
      
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

  // Dashboard KPIs Component
  const DashboardKPIs = () => {
    return (
      <div className="space-y-6">
        <div className="text-center text-white p-8">
          <h3 className="text-xl font-semibold mb-2">Dashboard KPIs</h3>
          <p className="text-slate-400">Monitoramento avançado de performance hoteleira</p>
        </div>
      </div>
    );
  };

  // Manual Forecast Component
  const ManualForecast = () => {
    return (
      <div className="space-y-6">
        <div className="text-center text-white p-8">
          <h3 className="text-xl font-semibold mb-2">Manual Forecast</h3>
          <p className="text-slate-400">Previsões manuais e análise de pace</p>
        </div>
      </div>
    );
  };

  // Reports Module Component
  const ReportsModule = () => {
    return (
      <div className="space-y-6">
        <div className="text-center text-white p-8">
          <h3 className="text-xl font-semibold mb-2">Reports Module</h3>
          <p className="text-slate-400">Relatórios executivos e análises detalhadas</p>
        </div>
      </div>
    );
  };

  // Pricing and Inventory Component
  const PricingAndInventory = () => {
    return (
      <div className="space-y-6">
        <div className="text-center text-white p-8">
          <h3 className="text-xl font-semibold mb-2">Pricing Tools</h3>
          <p className="text-slate-400">Estratégias de preços e gestão de inventário</p>
        </div>
      </div>
    );
  };

  // Revenue Management Advanced Component
  const RevenueManagementAdvanced = () => {
    return (
      <div className="space-y-6">
        <div className="text-center text-white p-8">
          <h3 className="text-xl font-semibold mb-2">Advanced Tools</h3>
          <p className="text-slate-400">Ferramentas avançadas de revenue management</p>
        </div>
      </div>
    );
  };

  // Strategic Tools Component
  const StrategicTools = () => {
    const [activeStrategicTab, setActiveStrategicTab] = useState('simulator');
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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ferramentas Estratégicas</h2>
              <p className="text-slate-400">Simulador de Cenários e Otimizador de Mix</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
            <button
              onClick={() => setActiveStrategicTab('simulator')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeStrategicTab === 'simulator'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-blue-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Simulador de Cenários
              </div>
            </button>
            <button
              onClick={() => setActiveStrategicTab('optimizer')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeStrategicTab === 'optimizer'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-blue-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Otimizador de Mix
              </div>
            </button>
          </div>
        </div>

        {activeStrategicTab === 'simulator' && (
          <div className="space-y-6">
            {/* Simulator Controls */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Simulador de Cenários</h3>
                <div className="flex gap-3">
                  <button
                    onClick={runSimulation}
                    disabled={simulationRunning}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
                  <button className="px-4 py-2 border border-slate-600 hover:bg-slate-700/50 text-slate-300 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configurar
                  </button>
                </div>
              </div>

              {/* Base Parameters */}
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

              {/* Simulation Results */}
              {simulationResults && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Resultados dos Cenários</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* Revenue Comparison */}
                    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                      <h5 className="font-medium text-slate-300 mb-3">Comparação de Receita</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={simulationResults}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }}
                            formatter={(value) => `R$ ${value.toLocaleString()}`} 
                          />
                          <Bar dataKey="revenue" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* RevPAR Comparison */}
                    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                      <h5 className="font-medium text-slate-300 mb-3">Comparação de RevPAR</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={simulationResults}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }}
                            formatter={(value) => `R$ ${value}`} 
                          />
                          <Line type="monotone" dataKey="revpar" stroke="#10b981" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Scenarios Table */}
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-700/50">
                          <th className="p-3 text-left font-medium text-slate-300">Cenário</th>
                          <th className="p-3 text-right font-medium text-slate-300">Receita</th>
                          <th className="p-3 text-right font-medium text-slate-300">Ocupação</th>
                          <th className="p-3 text-right font-medium text-slate-300">ADR</th>
                          <th className="p-3 text-right font-medium text-slate-300">RevPAR</th>
                          <th className="p-3 text-center font-medium text-slate-300">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulationResults.map((scenario, index) => (
                          <tr key={index} className="border-b border-slate-600 hover:bg-slate-700/30">
                            <td className="p-3 font-medium text-white">{scenario.name}</td>
                            <td className="p-3 text-right text-slate-300">R$ {scenario.revenue.toLocaleString()}</td>
                            <td className="p-3 text-right text-slate-300">{scenario.occupancy}%</td>
                            <td className="p-3 text-right text-slate-300">R$ {scenario.adr}</td>
                            <td className="p-3 text-right text-slate-300">R$ {scenario.revpar}</td>
                            <td className="p-3 text-center">
                              {index === 0 ? (
                                <span className="px-2 py-1 bg-slate-600 text-slate-300 rounded-full text-xs">Atual</span>
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

        {activeStrategicTab === 'optimizer' && (
          <div className="space-y-6">
            {/* Optimizer Controls */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Otimizador de Mix de Segmentos</h3>
                <div className="flex gap-3">
                  <button
                    onClick={runOptimization}
                    disabled={optimizationRunning}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
                  <button className="px-4 py-2 border border-slate-600 hover:bg-slate-700/50 text-slate-300 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                  </button>
                </div>
              </div>

              {/* Current Mix */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {Object.entries(scenarioData.segments).map(([key, segment], index) => (
                  <div key={key} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-300 capitalize">{key}</span>
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index] }} />
                    </div>
                    <div className="text-lg font-bold text-white">{segment.allocation}%</div>
                    <div className="text-sm text-slate-400">R$ {segment.rate}</div>
                    <div className="text-xs text-slate-500">Demanda: {segment.demand}%</div>
                  </div>
                ))}
              </div>

              {optimizationResults && (
                <div className="space-y-6">
                  {/* Visual Comparison */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Current Mix */}
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
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }}
                            formatter={(value) => `${value}%`} 
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Optimized Mix */}
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
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }}
                            formatter={(value) => `${value}%`} 
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Improvement Metrics */}
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
                    <h4 className="text-lg font-semibold text-white mb-4">Impacto da Otimização</h4>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-1">
                          +R$ {optimizationResults.improvement.revenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-400">Aumento de Receita</div>
                        <div className="text-xs text-green-400 font-medium">
                          +{Math.round((optimizationResults.improvement.revenue / optimizationResults.current.revenue) * 100)}%
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                          +{optimizationResults.improvement.occupancy}%
                        </div>
                        <div className="text-sm text-slate-400">Aumento de Ocupação</div>
                        <div className="text-xs text-blue-400 font-medium">
                          {optimizationResults.current.occupancy}% → {optimizationResults.optimized.occupancy}%
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-1">
                          +R$ {optimizationResults.improvement.revpar}
                        </div>
                        <div className="text-sm text-slate-400">Aumento RevPAR</div>
                        <div className="text-xs text-purple-400 font-medium">
                          +{Math.round((optimizationResults.improvement.revpar / 222) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Recommendations */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Recomendações de Ajuste</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-400 rounded-full" />
                          <span className="font-medium text-white">Corporate</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-300">{optimizationResults.current.corporate}% → {optimizationResults.optimized.corporate}%</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                            +{optimizationResults.optimized.corporate - optimizationResults.current.corporate}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full" />
                          <span className="font-medium text-white">Leisure</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-300">{optimizationResults.current.leisure}% → {optimizationResults.optimized.leisure}%</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                            {optimizationResults.optimized.leisure - optimizationResults.current.leisure}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-orange-400 rounded-full" />
                          <span className="font-medium text-white">Groups</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-300">{optimizationResults.current.groups}% → {optimizationResults.optimized.groups}%</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                            {optimizationResults.optimized.groups - optimizationResults.current.groups}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-400 rounded-full" />
                          <span className="font-medium text-white">Online</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-300">{optimizationResults.current.online}% → {optimizationResults.optimized.online}%</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                            +{optimizationResults.optimized.online - optimizationResults.current.online}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Aplicar Otimização
                      </button>
                      <button className="px-4 py-2 border border-slate-600 hover:bg-slate-700/50 text-slate-300 rounded-lg font-medium transition-colors flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer with Information */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-4">
              <span>Última atualização: Hoje, 14:32</span>
              <span>•</span>
              <span>Dados em tempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Sistema Online</span>
            </div>
          </div>
        </div>
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
                onClick={() => navigate('/dashboard')}
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
                <p className="text-xs text-slate-400">Revenue Management System</p>
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
          <TabsList className="grid w-full grid-cols-8 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard KPIs
            </TabsTrigger>
            <TabsTrigger value="forecast" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Manual Forecast
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Revenue Analytics
            </TabsTrigger>
            <TabsTrigger value="competitive" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              Competitive Analysis
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Pricing Tools
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Bed className="w-4 h-4 mr-2" />
              Advanced Tools
            </TabsTrigger>
            <TabsTrigger value="strategic" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Brain className="w-4 h-4 mr-2" />
              Strategic Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardKPIs />
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <ManualForecast />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center text-white p-8">
              <h3 className="text-xl font-semibold mb-2">Revenue Analytics</h3>
              <p className="text-slate-400">Análises detalhadas de sazonalidade, segmentação e pick-up</p>
            </div>
          </TabsContent>

          <TabsContent value="competitive" className="space-y-6">
            <div className="text-center text-white p-8">
              <h3 className="text-xl font-semibold mb-2">Competitive Analysis</h3>
              <p className="text-slate-400">Benchmarking competitivo e análises preditivas</p>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsModule />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <PricingAndInventory />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <RevenueManagementAdvanced />
          </TabsContent>

          <TabsContent value="strategic" className="space-y-6">
            <StrategicTools />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RMSForecastPace;
