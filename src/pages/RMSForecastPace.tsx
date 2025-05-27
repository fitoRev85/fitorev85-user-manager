
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Target, BarChart3, DollarSign, Users, Percent, Edit3, Save, X, ChevronLeft, ChevronRight, Eye, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Area, AreaChart } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const RMSForecastPace = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState('1');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingForecast, setEditingForecast] = useState(null);
  const [forecastData, setForecastData] = useState({});
  const [paceData, setPaceData] = useState({});

  // Propriedades simuladas
  const properties = [
    { id: '1', name: 'Grand Hotel Luxo', category: 'Luxo', uh: 120, city: 'São Paulo' },
    { id: '2', name: 'Boutique Charm', category: 'Boutique', uh: 45, city: 'Rio de Janeiro' },
    { id: '3', name: 'Resort Paradise', category: 'Resort', uh: 200, city: 'Florianópolis' },
    { id: '4', name: 'Business Center', category: 'Corporativo', uh: 80, city: 'Brasília' }
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

            // Calcular revenue atual baseado na ocupação e diária atuais
            const currentData = data[property.id][year][month];
            currentData.revenueActual = Math.round(currentData.occupancyActual / 100 * property.uh * currentData.dailyRateActual * 30);
            
            // Pace data
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
    
    // Recalcular revenue se ocupação ou diária mudaram
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
    
    // Recalcular pace
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

  const currentMonthData = getCurrentMonthData();
  const currentPaceData = getCurrentPaceData();
  const property = getCurrentProperty();

  if (!currentMonthData || !property) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="text-white">Carregando dados...</div>
    </div>;
  }

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
              <p className="text-slate-400">Forecast Manual e Pace de Vendas</p>
            </div>
          </div>
        </div>

        {/* Controles Principais */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Propriedade</label>
              <select 
                value={selectedProperty} 
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* KPIs do Mês Atual */}
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

        {/* Gráficos */}
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
      </div>
    </div>
  );
};

export default RMSForecastPace;
