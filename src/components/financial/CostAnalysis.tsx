
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Target, Zap, DollarSign, Percent, Users, Settings } from 'lucide-react';

const CostAnalysis = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const costCategories = [
    {
      id: 'pessoal',
      name: 'Pessoal',
      value: 280000,
      budget: 270000,
      variance: 10000,
      trend: 'up',
      subcategories: [
        { name: 'Salários', value: 220000, percentage: 78.6 },
        { name: 'Encargos', value: 40000, percentage: 14.3 },
        { name: 'Benefícios', value: 15000, percentage: 5.4 },
        { name: 'Treinamento', value: 5000, percentage: 1.7 }
      ]
    },
    {
      id: 'operacional',
      name: 'Operacional',
      value: 120000,
      budget: 115000,
      variance: 5000,
      trend: 'up',
      subcategories: [
        { name: 'Energia', value: 45000, percentage: 37.5 },
        { name: 'Manutenção', value: 35000, percentage: 29.2 },
        { name: 'Limpeza', value: 25000, percentage: 20.8 },
        { name: 'Segurança', value: 15000, percentage: 12.5 }
      ]
    },
    {
      id: 'comercial',
      name: 'Comercial',
      value: 110000,
      budget: 120000,
      variance: -10000,
      trend: 'down',
      subcategories: [
        { name: 'Comissões OTA', value: 85000, percentage: 77.3 },
        { name: 'Marketing', value: 15000, percentage: 13.6 },
        { name: 'Vendas', value: 10000, percentage: 9.1 }
      ]
    },
    {
      id: 'administrativo',
      name: 'Administrativo',
      value: 90000,
      budget: 85000,
      variance: 5000,
      trend: 'up',
      subcategories: [
        { name: 'Contabilidade', value: 25000, percentage: 27.8 },
        { name: 'Jurídico', value: 20000, percentage: 22.2 },
        { name: 'TI', value: 18000, percentage: 20.0 },
        { name: 'RH', value: 15000, percentage: 16.7 },
        { name: 'Outros', value: 12000, percentage: 13.3 }
      ]
    }
  ];

  const totalCosts = costCategories.reduce((sum, cat) => sum + cat.value, 0);
  const totalBudget = costCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalVariance = totalCosts - totalBudget;

  const monthlyTrend = [
    { month: 'Jan', pessoal: 275000, operacional: 110000, comercial: 95000, administrativo: 82000 },
    { month: 'Fev', pessoal: 278000, operacional: 115000, comercial: 105000, administrativo: 85000 },
    { month: 'Mar', pessoal: 282000, operacional: 118000, comercial: 108000, administrativo: 88000 },
    { month: 'Abr', pessoal: 276000, operacional: 112000, comercial: 98000, administrativo: 84000 },
    { month: 'Mai', pessoal: 285000, operacional: 125000, comercial: 115000, administrativo: 92000 },
    { month: 'Jun', pessoal: 280000, operacional: 120000, comercial: 110000, administrativo: 90000 }
  ];

  const costPerRoom = [
    { category: 'Pessoal', costPerRoom: 155, benchmark: 140, efficiency: 'below' },
    { category: 'Operacional', costPerRoom: 67, benchmark: 70, efficiency: 'above' },
    { category: 'Comercial', costPerRoom: 61, benchmark: 55, efficiency: 'below' },
    { category: 'Administrativo', costPerRoom: 50, benchmark: 45, efficiency: 'below' }
  ];

  const gargalos = [
    {
      area: 'Comissões OTA',
      impacto: 'Alto',
      valor: 85000,
      potencialEconomia: 12000,
      prazo: 'Curto',
      acao: 'Renegociar contratos e diversificar canais'
    },
    {
      area: 'Energia Elétrica',
      impacto: 'Médio',
      valor: 45000,
      potencialEconomia: 8000,
      prazo: 'Médio',
      acao: 'Implementar sistema de automação'
    },
    {
      area: 'Manutenção Corretiva',
      impacto: 'Médio',
      valor: 20000,
      potencialEconomia: 6000,
      prazo: 'Longo',
      acao: 'Plano de manutenção preventiva'
    },
    {
      area: 'Horas Extras',
      impacto: 'Baixo',
      valor: 15000,
      potencialEconomia: 4000,
      prazo: 'Curto',
      acao: 'Otimizar escalas e contratar temporários'
    }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const getImpactBadge = (impacto) => {
    switch (impacto) {
      case 'Alto':
        return <Badge className="bg-red-600">Alto Impacto</Badge>;
      case 'Médio':
        return <Badge className="bg-orange-600">Médio Impacto</Badge>;
      case 'Baixo':
        return <Badge className="bg-green-600">Baixo Impacto</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Análise de Custos e Gargalos</h2>
          <p className="text-gray-400">Identificação de oportunidades de otimização e redução de custos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Settings className="w-4 h-4 mr-2" />
            Configurar Alertas
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Target className="w-4 h-4 mr-2" />
            Plano de Ação
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Custo Total</p>
                <p className="text-xl font-bold text-red-400">
                  R$ {totalCosts.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {totalVariance > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400">+{((totalVariance/totalBudget)*100).toFixed(1)}% vs orçado</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">{((totalVariance/totalBudget)*100).toFixed(1)}% vs orçado</span>
                    </>
                  )}
                </div>
              </div>
              <DollarSign className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Custo por Quarto</p>
                <p className="text-xl font-bold text-orange-400">R$ 333</p>
                <p className="text-xs text-gray-500 mt-1">180 quartos disponíveis</p>
              </div>
              <Users className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Variação Orçamento</p>
                <p className={`text-xl font-bold ${totalVariance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {totalVariance > 0 ? '+' : ''}R$ {Math.abs(totalVariance).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((Math.abs(totalVariance)/totalBudget)*100).toFixed(1)}% de desvio
                </p>
              </div>
              <Percent className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Potencial Economia</p>
                <p className="text-xl font-bold text-green-400">R$ 30.000</p>
                <p className="text-xs text-gray-500 mt-1">5% dos custos totais</p>
              </div>
              <Target className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Por Categoria
          </TabsTrigger>
          <TabsTrigger value="bottlenecks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Gargalos
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Eficiência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            
            {/* Evolução Mensal */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Evolução de Custos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
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
                    <Line type="monotone" dataKey="pessoal" stroke="#3B82F6" strokeWidth={2} name="Pessoal" />
                    <Line type="monotone" dataKey="operacional" stroke="#10B981" strokeWidth={2} name="Operacional" />
                    <Line type="monotone" dataKey="comercial" stroke="#F59E0B" strokeWidth={2} name="Comercial" />
                    <Line type="monotone" dataKey="administrativo" stroke="#EF4444" strokeWidth={2} name="Administrativo" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição Atual */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                    >
                      {costCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                      formatter={(value) => [`R$ ${value.toLocaleString()}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resumo por Categoria */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Resumo por Categoria de Custo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {costCategories.map((category, index) => (
                  <div key={category.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <h3 className="text-white font-medium">{category.name}</h3>
                      </div>
                      {category.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Realizado:</span>
                        <span className="text-white font-medium">R$ {category.value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Orçado:</span>
                        <span className="text-gray-400">R$ {category.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Variação:</span>
                        <span className={`font-medium ${category.variance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {category.variance > 0 ? '+' : ''}R$ {Math.abs(category.variance).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">% Total:</span>
                        <span className="text-blue-400">{((category.value / totalCosts) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Principais Gargalos de Custo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gargalos.map((gargalo, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-medium">{gargalo.area}</h3>
                          {getImpactBadge(gargalo.impacto)}
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{gargalo.acao}</p>
                      </div>
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs">Custo Atual</p>
                        <p className="text-red-400 font-medium">R$ {gargalo.valor.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Economia Potencial</p>
                        <p className="text-green-400 font-medium">R$ {gargalo.potencialEconomia.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Prazo Implementação</p>
                        <p className="text-blue-400 font-medium">{gargalo.prazo} Prazo</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">ROI Estimado</p>
                        <p className="text-purple-400 font-medium">
                          {((gargalo.potencialEconomia / gargalo.valor) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Zap className="w-3 h-3 mr-1" />
                        Implementar
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Análise de Eficiência - Custo por Quarto</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costPerRoom}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                    formatter={(value) => [`R$ ${value}`, '']}
                  />
                  <Bar dataKey="costPerRoom" fill="#3B82F6" name="Custo Atual" />
                  <Bar dataKey="benchmark" fill="#10B981" name="Benchmark Mercado" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                {costPerRoom.map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg ${item.efficiency === 'above' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{item.category}</h4>
                      {item.efficiency === 'above' ? (
                        <Badge className="bg-green-600">Eficiente</Badge>
                      ) : (
                        <Badge className="bg-red-600">Ineficiente</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Nosso Custo:</p>
                        <p className="text-white">R$ {item.costPerRoom}/quarto</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Benchmark:</p>
                        <p className="text-gray-300">R$ {item.benchmark}/quarto</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-400">
                        Diferença: 
                        <span className={`ml-1 font-medium ${item.efficiency === 'above' ? 'text-green-400' : 'text-red-400'}`}>
                          {item.efficiency === 'above' ? '-' : '+'}R$ {Math.abs(item.costPerRoom - item.benchmark)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostAnalysis;
