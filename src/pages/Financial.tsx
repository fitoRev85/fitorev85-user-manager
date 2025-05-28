
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Download, Plus, Edit, Trash2, Calculator, FileText, CreditCard } from 'lucide-react';
import DREReport from '@/components/financial/DREReport';
import OTAManagement from '@/components/financial/OTAManagement';
import CostAnalysis from '@/components/financial/CostAnalysis';

const Financial = () => {
  const [activeTab, setActiveTab] = useState('dre');

  // Dados financeiros resumidos
  const financialSummary = {
    revenue: 850000,
    costs: 680000,
    profit: 170000,
    margin: 20,
    otaCommissions: 85000,
    operationalCosts: 450000,
    fixedCosts: 145000
  };

  const monthlyData = [
    { month: 'Jan', revenue: 750000, costs: 600000, profit: 150000 },
    { month: 'Fev', revenue: 820000, costs: 650000, profit: 170000 },
    { month: 'Mar', revenue: 880000, costs: 700000, profit: 180000 },
    { month: 'Abr', revenue: 760000, costs: 580000, profit: 180000 },
    { month: 'Mai', revenue: 950000, costs: 720000, profit: 230000 },
    { month: 'Jun', revenue: 850000, costs: 680000, profit: 170000 }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Módulo Financeiro</h1>
              <p className="text-gray-400">Gestão completa de receitas, custos e análises financeiras</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Entrada
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Receita Total</p>
                  <p className="text-2xl font-bold text-green-400">
                    R$ {financialSummary.revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400">+12% vs mês anterior</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Custos Totais</p>
                  <p className="text-2xl font-bold text-red-400">
                    R$ {financialSummary.costs.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">+5% vs mês anterior</span>
                  </div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-blue-400">
                    R$ {financialSummary.profit.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-400">+25% vs mês anterior</span>
                  </div>
                </div>
                <Calculator className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Margem de Lucro</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {financialSummary.margin}%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-400">+2.5% vs mês anterior</span>
                  </div>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Evolução Financeira Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value) => [`R$ ${value.toLocaleString()}`, '']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} name="Receita" />
                <Line type="monotone" dataKey="costs" stroke="#EF4444" strokeWidth={3} name="Custos" />
                <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabs dos Módulos */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger 
              value="dre" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              DRE - Demonstrativo
            </TabsTrigger>
            <TabsTrigger 
              value="ota" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Gestão de OTAs
            </TabsTrigger>
            <TabsTrigger 
              value="costs" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Análise de Custos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dre">
            <DREReport />
          </TabsContent>

          <TabsContent value="ota">
            <OTAManagement />
          </TabsContent>

          <TabsContent value="costs">
            <CostAnalysis />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Financial;
