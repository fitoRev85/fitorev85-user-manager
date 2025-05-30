
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Building2, LogOut, Brain, Target, Bell, Database, BarChart3, Calendar, FileText
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';

// Import dos componentes
import ForecastDashboard from '@/components/forecast/ForecastDashboard';
import MLForecasting from '@/components/forecast/MLForecasting';
import CompetitiveAnalysis from '@/components/forecast/CompetitiveAnalysis';
import AlertsSystem from '@/components/forecast/AlertsSystem';
import DataManagement from '@/components/forecast/DataManagement';
import ManualForecast from '@/components/forecast/ManualForecast';

const RMSForecastPace = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProperty, setSelectedProperty] = useState(propertyId || '1');
  
  const { properties, getProperty } = useProperties();

  useEffect(() => {
    if (propertyId) {
      setSelectedProperty(propertyId);
    }
  }, [propertyId]);

  const getCurrentProperty = () => getProperty(selectedProperty);

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
                  FitoRev85 - RMS Avançado
                </h1>
                <p className="text-xs text-slate-400">{getCurrentProperty()?.name || 'Revenue Management System'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Seletor de Propriedade */}
              <div className="hidden md:flex items-center gap-2">
                <label className="text-sm text-slate-400">Propriedade:</label>
                <select 
                  value={selectedProperty} 
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1 text-white text-sm"
                >
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

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
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="manual-forecast" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Forecast Manual
            </TabsTrigger>
            <TabsTrigger value="ml-forecasting" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Brain className="w-4 h-4 mr-2" />
              ML Forecasting
            </TabsTrigger>
            <TabsTrigger value="competitive" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              Competitivo
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Database className="w-4 h-4 mr-2" />
              Dados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ForecastDashboard />
          </TabsContent>

          <TabsContent value="manual-forecast" className="space-y-6">
            <ManualForecast />
          </TabsContent>

          <TabsContent value="ml-forecasting" className="space-y-6">
            <MLForecasting />
          </TabsContent>

          <TabsContent value="competitive" className="space-y-6">
            <CompetitiveAnalysis />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsSystem />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RMSForecastPace;
