
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Calendar, BarChart3, PieChart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PeriodComparison from '@/components/analysis/PeriodComparison';
import VarianceAnalysis from '@/components/analysis/VarianceAnalysis';
import KPITrending from '@/components/analysis/KPITrending';
import ChannelSegmentation from '@/components/analysis/ChannelSegmentation';

const AnalysisPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
              Análises Comparativas
            </h1>
            <p className="text-xl text-slate-300">
              Análises avançadas de performance e tendências
            </p>
          </div>
        </div>

        {/* Navegação principal */}
        <Tabs defaultValue="period" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger 
              value="period" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Período x Período
            </TabsTrigger>
            <TabsTrigger 
              value="variance" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Orçado vs Realizado
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Trending KPIs
            </TabsTrigger>
            <TabsTrigger 
              value="channels" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <PieChart className="w-4 h-4" />
              Segmentação por Canal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="period">
            <PeriodComparison />
          </TabsContent>

          <TabsContent value="variance">
            <VarianceAnalysis />
          </TabsContent>

          <TabsContent value="trending">
            <KPITrending />
          </TabsContent>

          <TabsContent value="channels">
            <ChannelSegmentation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalysisPage;
