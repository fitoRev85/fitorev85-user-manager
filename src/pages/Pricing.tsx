
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calculator, TrendingUp, Settings, History } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import PricingCalculator from '@/components/pricing/PricingCalculator';
import SeasonalRules from '@/components/pricing/SeasonalRules';
import PricingSimulator from '@/components/pricing/PricingSimulator';
import PricingHistory from '@/components/pricing/PricingHistory';

const Pricing = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { getProperty } = useProperties();
  
  const property = propertyId ? getProperty(propertyId) : null;

  if (!propertyId || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-4">Propriedade não encontrada</h2>
              <Button onClick={() => navigate('/')} variant="outline">
                Voltar para Propriedades
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Gestão de Preços</h1>
              <p className="text-slate-300">{property.name} • {property.location}</p>
            </div>
          </div>
        </div>

        {/* Tabs de navegação */}
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger 
              value="calculator" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger 
              value="rules" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Regras Sazonais
            </TabsTrigger>
            <TabsTrigger 
              value="simulator" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Simulador
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <PricingCalculator propertyId={propertyId} property={property} />
          </TabsContent>

          <TabsContent value="rules">
            <SeasonalRules propertyId={propertyId} />
          </TabsContent>

          <TabsContent value="simulator">
            <PricingSimulator propertyId={propertyId} property={property} />
          </TabsContent>

          <TabsContent value="history">
            <PricingHistory propertyId={propertyId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Pricing;
