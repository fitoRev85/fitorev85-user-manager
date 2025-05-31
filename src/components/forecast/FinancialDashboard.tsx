
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CreditCard, Calculator, FileText } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';

interface FinancialDashboardProps {
  propertyId: string;
}

const FinancialDashboard = ({ propertyId }: FinancialDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { getProperty } = useProperties();
  
  const currentProperty = getProperty(propertyId);

  // Dados financeiros simulados baseados na propriedade selecionada
  const financialData = useMemo(() => {
    if (!currentProperty) return null;

    // Simular dados baseados no número de quartos da propriedade
    const baseRevenue = currentProperty.rooms * 200; // R$ 200 por quarto base
    const occupancyRate = currentProperty.occupancy || 75;
    const adr = currentProperty.adr || 250;

    return {
      revenue: Math.round(baseRevenue * (occupancyRate / 100) * 30), // Mensal
      costs: Math.round(baseRevenue * (occupancyRate / 100) * 30 * 0.7), // 70% da receita
      profit: Math.round(baseRevenue * (occupancyRate / 100) * 30 * 0.3), // 30% margem
      margin: 30,
      otaCommissions: Math.round(baseRevenue * (occupancyRate / 100) * 30 * 0.12), // 12% comissão OTA
      operationalCosts: Math.round(baseRevenue * (occupancyRate / 100) * 30 * 0.45),
      fixedCosts: Math.round(baseRevenue * (occupancyRate / 100) * 30 * 0.25),
      occupancy: occupancyRate,
      adr: adr,
      revpar: Math.round(adr * (occupancyRate / 100))
    };
  }, [currentProperty, propertyId]);

  // Dados mensais baseados na propriedade
  const monthlyData = useMemo(() => {
    if (!financialData) return [];

    return [
      { month: 'Jan', revenue: financialData.revenue * 0.8, costs: financialData.costs * 0.8, profit: financialData.profit * 0.8 },
      { month: 'Fev', revenue: financialData.revenue * 0.75, costs: financialData.costs * 0.75, profit: financialData.profit * 0.75 },
      { month: 'Mar', revenue: financialData.revenue * 0.9, costs: financialData.costs * 0.85, profit: financialData.profit * 1.1 },
      { month: 'Abr', revenue: financialData.revenue * 1.1, costs: financialData.costs * 0.9, profit: financialData.profit * 1.3 },
      { month: 'Mai', revenue: financialData.revenue * 1.2, costs: financialData.costs * 0.95, profit: financialData.profit * 1.5 },
      { month: 'Jun', revenue: financialData.revenue, costs: financialData.costs, profit: financialData.profit }
    ];
  }, [financialData]);

  const otaData = [
    { name: 'Booking.com', revenue: financialData?.revenue * 0.35 || 0, commission: 15, bookings: 145 },
    { name: 'Expedia', revenue: financialData?.revenue * 0.25 || 0, commission: 18, bookings: 98 },
    { name: 'Airbnb', revenue: financialData?.revenue * 0.15 || 0, commission: 12, bookings: 67 },
    { name: 'Direto', revenue: financialData?.revenue * 0.25 || 0, commission: 0, bookings: 234 }
  ];

  if (!currentProperty || !financialData) {
    return (
      <div className="text-center text-slate-400 py-12">
        <p>Propriedade não encontrada ou dados indisponíveis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Propriedade */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{currentProperty.name}</h2>
              <p className="text-slate-400">{currentProperty.location} • {currentProperty.rooms} quartos</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">
                R$ {financialData.revpar.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">RevPAR Atual</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Receita Mensal</p>
                <p className="text-2xl font-bold text-green-400">
                  R$ {financialData.revenue.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">+8.5% vs mês anterior</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Custos Totais</p>
                <p className="text-2xl font-bold text-red-400">
                  R$ {financialData.costs.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">+3.2% vs mês anterior</span>
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Lucro Líquido</p>
                <p className="text-2xl font-bold text-blue-400">
                  R$ {financialData.profit.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-400">+18.7% vs mês anterior</span>
                </div>
              </div>
              <Calculator className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Margem de Lucro</p>
                <p className="text-2xl font-bold text-purple-400">
                  {financialData.margin}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-400">+1.8% vs mês anterior</span>
                </div>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Evolução Financeira - {currentProperty.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
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

      {/* Tabs para análises específicas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800/50 border-slate-700/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="ota" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            Canais de Venda
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Análise de Custos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Operacionais', value: financialData.operationalCosts, fill: '#3B82F6' },
                        { name: 'Fixos', value: financialData.fixedCosts, fill: '#10B981' },
                        { name: 'Comissões OTA', value: financialData.otaCommissions, fill: '#F59E0B' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Indicadores Operacionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Ocupação</span>
                  <span className="text-white font-bold">{financialData.occupancy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">ADR</span>
                  <span className="text-white font-bold">R$ {financialData.adr}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">RevPAR</span>
                  <span className="text-white font-bold">R$ {financialData.revpar}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Total de Quartos</span>
                  <span className="text-white font-bold">{currentProperty.rooms}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ota">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Performance por Canal de Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Canal</th>
                      <th className="text-right py-3 px-4 text-slate-300 font-medium">Receita</th>
                      <th className="text-center py-3 px-4 text-slate-300 font-medium">Comissão</th>
                      <th className="text-center py-3 px-4 text-slate-300 font-medium">Reservas</th>
                      <th className="text-right py-3 px-4 text-slate-300 font-medium">Receita Líquida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otaData.map((ota, index) => {
                      const liquidRevenue = ota.revenue * (1 - ota.commission / 100);
                      return (
                        <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-4 text-white font-medium">{ota.name}</td>
                          <td className="py-3 px-4 text-right text-white">R$ {ota.revenue.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center text-yellow-400">{ota.commission}%</td>
                          <td className="py-3 px-4 text-center text-slate-300">{ota.bookings}</td>
                          <td className="py-3 px-4 text-right text-green-400">R$ {liquidRevenue.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Análise Detalhada de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                    formatter={(value) => [`R$ ${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="costs" fill="#EF4444" name="Custos Totais" />
                  <Bar dataKey="profit" fill="#10B981" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
