
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { MetasDefinition } from '@/components/budget/MetasDefinition';
import { BudgetTracking } from '@/components/budget/BudgetTracking';
import { BudgetDashboard } from '@/components/budget/BudgetDashboard';
import { VarianceAnalysis } from '@/components/budget/VarianceAnalysis';
import { useProperties } from '@/hooks/useProperties';

const BudgetMetas = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<string>('property_1');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const years = [
    new Date().getFullYear() - 1,
    new Date().getFullYear(),
    new Date().getFullYear() + 1
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
              Budget & Metas
            </h1>
            <p className="text-xl text-slate-300">
              Orçamento e acompanhamento de metas por propriedade
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
                <label className="text-sm text-slate-400">Ano</label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-white">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navegação por abas */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="metas" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Definir Metas
            </TabsTrigger>
            <TabsTrigger 
              value="acompanhamento" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Acompanhamento
            </TabsTrigger>
            <TabsTrigger 
              value="analise" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Análise de Desvios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <BudgetDashboard 
              propertyId={selectedProperty}
              year={selectedYear}
            />
          </TabsContent>

          <TabsContent value="metas">
            <MetasDefinition 
              propertyId={selectedProperty}
              year={selectedYear}
            />
          </TabsContent>

          <TabsContent value="acompanhamento">
            <BudgetTracking 
              propertyId={selectedProperty}
              year={selectedYear}
            />
          </TabsContent>

          <TabsContent value="analise">
            <VarianceAnalysis 
              propertyId={selectedProperty}
              year={selectedYear}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BudgetMetas;
