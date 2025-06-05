
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, TrendingUp, BarChart3, DollarSign, Trophy, AlertCircle } from 'lucide-react';
import PricePositioningSimulator from '@/components/competitive/PricePositioningSimulator';
import PerformanceGapAnalysis from '@/components/competitive/PerformanceGapAnalysis';
import InternalBenchmarking from '@/components/competitive/InternalBenchmarking';
import RevenueOpportunities from '@/components/competitive/RevenueOpportunities';
import CompetitivenessScore from '@/components/competitive/CompetitivenessScore';

const CompetitiveIntelligence = () => {
  const navigate = useNavigate();

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
              <h1 className="text-3xl font-bold text-white">Inteligência Competitiva</h1>
              <p className="text-slate-300">Análise competitiva e posicionamento de mercado</p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Score Médio</p>
                  <p className="text-lg font-bold text-white">8.2/10</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Oportunidades</p>
                  <p className="text-lg font-bold text-white">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Potencial Receita</p>
                  <p className="text-lg font-bold text-white">+15%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Posição Ranking</p>
                  <p className="text-lg font-bold text-white">#2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="positioning" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger 
              value="positioning" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Posicionamento
            </TabsTrigger>
            <TabsTrigger 
              value="gaps" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Gaps de Performance
            </TabsTrigger>
            <TabsTrigger 
              value="benchmarking" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Benchmarking
            </TabsTrigger>
            <TabsTrigger 
              value="opportunities" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Oportunidades
            </TabsTrigger>
            <TabsTrigger 
              value="scores" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Scores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="positioning">
            <PricePositioningSimulator />
          </TabsContent>

          <TabsContent value="gaps">
            <PerformanceGapAnalysis />
          </TabsContent>

          <TabsContent value="benchmarking">
            <InternalBenchmarking />
          </TabsContent>

          <TabsContent value="opportunities">
            <RevenueOpportunities />
          </TabsContent>

          <TabsContent value="scores">
            <CompetitivenessScore />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompetitiveIntelligence;
