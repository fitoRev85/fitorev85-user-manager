
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import ChannelPerformance from '@/components/channels/ChannelPerformance';
import ChannelCosts from '@/components/channels/ChannelCosts';
import ChannelEvolution from '@/components/channels/ChannelEvolution';
import ChannelRecommendations from '@/components/channels/ChannelRecommendations';
import { useReservationData } from '@/hooks/useReservationData';

const ChannelAnalysis = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<string>('property_1');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('last12months');
  
  const { data: reservationData, loading } = useReservationData(selectedProperty);

  const properties = [
    { id: 'property_1', name: 'Hotel Principal' },
    { id: 'property_2', name: 'Pousada Centro' },
    { id: 'property_3', name: 'Resort Beach' }
  ];

  const periods = [
    { value: 'last3months', label: 'Últimos 3 meses' },
    { value: 'last6months', label: 'Últimos 6 meses' },
    { value: 'last12months', label: 'Últimos 12 meses' },
    { value: 'ytd', label: 'Ano atual' },
    { value: 'custom', label: 'Período customizado' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white">
              Análise de Canais
            </h1>
            <p className="text-xl text-slate-300">
              Performance detalhada dos canais de distribuição
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Propriedade</label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id} className="text-white">
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {periods.map((period) => (
                      <SelectItem key={period.value} value={period.value} className="text-white">
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navegação por abas */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger 
              value="performance" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="costs" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Custos & Comissões
            </TabsTrigger>
            <TabsTrigger 
              value="evolution" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Evolução
            </TabsTrigger>
            <TabsTrigger 
              value="recommendations" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Recomendações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <ChannelPerformance 
              data={reservationData} 
              loading={loading}
              propertyId={selectedProperty}
              period={selectedPeriod}
            />
          </TabsContent>

          <TabsContent value="costs">
            <ChannelCosts 
              data={reservationData} 
              loading={loading}
              propertyId={selectedProperty}
              period={selectedPeriod}
            />
          </TabsContent>

          <TabsContent value="evolution">
            <ChannelEvolution 
              data={reservationData} 
              loading={loading}
              propertyId={selectedProperty}
              period={selectedPeriod}
            />
          </TabsContent>

          <TabsContent value="recommendations">
            <ChannelRecommendations 
              data={reservationData} 
              loading={loading}
              propertyId={selectedProperty}
              period={selectedPeriod}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChannelAnalysis;
