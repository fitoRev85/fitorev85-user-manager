
import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, MapPin, LogOut, Bell, Plus, Settings, TrendingUp
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';
import { useEvents } from '@/hooks/useEvents';

// Import dos componentes que vamos criar
import EventsCalendar from '@/components/events/EventsCalendar';
import SeasonalPeriods from '@/components/events/SeasonalPeriods';
import HistoricalAnalysis from '@/components/events/HistoricalAnalysis';
import EventsAlerts from '@/components/events/EventsAlerts';

const EventsSeason = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedProperty, setSelectedProperty] = useState('1');
  
  const { properties, getProperty } = useProperties();
  const { alertsNaoVisualizados } = useEvents();

  const getCurrentProperty = () => getProperty(selectedProperty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
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
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-400 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                  Eventos & Sazonalidade
                </h1>
                <p className="text-xs text-slate-400">{getCurrentProperty()?.name || 'Gestão de Eventos e Períodos Sazonais'}</p>
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

              {/* Contador de Alertas */}
              {alertsNaoVisualizados.length > 0 && (
                <div className="relative">
                  <Bell className="w-5 h-5 text-orange-400" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {alertsNaoVisualizados.length}
                  </span>
                </div>
              )}

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
            <TabsTrigger value="calendar" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="seasons" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Temporadas
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Análise
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Alertas
              {alertsNaoVisualizados.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {alertsNaoVisualizados.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <EventsCalendar propertyId={selectedProperty} />
          </TabsContent>

          <TabsContent value="seasons" className="space-y-6">
            <SeasonalPeriods propertyId={selectedProperty} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <HistoricalAnalysis propertyId={selectedProperty} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <EventsAlerts propertyId={selectedProperty} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EventsSeason;
