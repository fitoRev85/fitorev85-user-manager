
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CreditCard, Calculator, FileText, Target } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';

interface FinancialDashboardProps {
  propertyId: string;
}

const FinancialDashboard = ({ propertyId }: FinancialDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { getProperty } = useProperties();
  
  // Estados para estimativa de custos
  const [estLimpeza, setEstLimpeza] = useState(25);
  const [estAmenities, setEstAmenities] = useState(15);
  const [estLavanderia, setEstLavanderia] = useState(18);
  const [estManutencao, setEstManutencao] = useState(12);
  const [estEnergia, setEstEnergia] = useState(20);
  const [estPessoal, setEstPessoal] = useState(35);
  const [diasEstadia, setDiasEstadia] = useState(1);
  
  const currentProperty = getProperty(propertyId);

  // Carregar dados CSV se disponíveis
  const csvData = useMemo(() => {
    try {
      const reservasData = localStorage.getItem(`reservas_data_${propertyId}`);
      const custosData = localStorage.getItem(`custos_data_${propertyId}`);
      
      return {
        reservas: reservasData ? JSON.parse(reservasData).data : [],
        custos: custosData ? JSON.parse(custosData).data : []
      };
    } catch {
      return { reservas: [], custos: [] };
    }
  }, [propertyId]);

  // Dados financeiros simulados baseados na propriedade selecionada
  const financialData = useMemo(() => {
    if (!currentProperty) return null;

    // Usar dados CSV se disponíveis, senão usar simulados
    let receita = 0;
    let custos = 0;

    if (csvData.reservas.length > 0) {
      receita = csvData.reservas.reduce((sum: number, reserva: any) => {
        return sum + (parseFloat(reserva.valor_total) || 0);
      }, 0);
    } else {
      const baseRevenue = currentProperty.rooms * 200;
      const occupancyRate = currentProperty.occupancy || 75;
      receita = Math.round(baseRevenue * (occupancyRate / 100) * 30);
    }

    if (csvData.custos.length > 0) {
      custos = csvData.custos.reduce((sum: number, custo: any) => {
        return sum + (parseFloat(custo.valor) || 0);
      }, 0);
    } else {
      custos = Math.round(receita * 0.7);
    }

    const profit = receita - custos;
    const margin = receita > 0 ? (profit / receita) * 100 : 0;
    const occupancyRate = currentProperty.occupancy || 75;
    const adr = currentProperty.adr || 250;

    return {
      revenue: receita,
      costs: custos,
      profit: profit,
      margin: Math.round(margin),
      otaCommissions: Math.round(receita * 0.12),
      operationalCosts: Math.round(custos * 0.64),
      fixedCosts: Math.round(custos * 0.36),
      occupancy: occupancyRate,
      adr: adr,
      revpar: Math.round(adr * (occupancyRate / 100))
    };
  }, [currentProperty, propertyId, csvData]);

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

  // Cálculo de estimativa de custos por diária
  const calcularCustoDiaria = () => {
    const custoBase = estLimpeza + estAmenities + estLavanderia + estManutencao + estEnergia + estPessoal;
    
    const calculos = [];
    for (let dias = 1; dias <= 7; dias++) {
      const custoTotal = custoBase * dias;
      const desconto = dias > 1 ? (dias - 1) * 5 : 0; // 5% desconto por dia adicional
      const custoComDesconto = custoTotal * (1 - desconto / 100);
      
      calculos.push({
        dias,
        custoTotal: custoComDesconto,
        custoPorDia: custoComDesconto / dias,
        economia: custoTotal - custoComDesconto
      });
    }
    
    return calculos;
  };

  const estimativasCusto = calcularCustoDiaria();

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
              {csvData.reservas.length > 0 && (
                <p className="text-sm text-green-400">✓ Dados CSV carregados: {csvData.reservas.length} reservas</p>
              )}
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
          <TabsTrigger value="estimates" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Target className="w-4 h-4 mr-2" />
            Estimativa de Custos
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

        <TabsContent value="estimates">
          <div className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Calculadora de Custos por Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Configuração de Custos */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Custos Base (R$/dia)</h3>
                    
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Limpeza</label>
                      <Input
                        type="number"
                        value={estLimpeza}
                        onChange={(e) => setEstLimpeza(Number(e.target.value))}
                        className="bg-slate-700/50 border-slate-600/50 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Amenities</label>
                      <Input
                        type="number"
                        value={estAmenities}
                        onChange={(e) => setEstAmenities(Number(e.target.value))}
                        className="bg-slate-700/50 border-slate-600/50 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Lavanderia</label>
                      <Input
                        type="number"
                        value={estLavanderia}
                        onChange={(e) => setEstLavanderia(Number(e.target.value))}
                        className="bg-slate-700/50 border-slate-600/50 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Manutenção</label>
                      <Input
                        type="number"
                        value={estManutencao}
                        onChange={(e) => setEstManutencao(Number(e.target.value))}
                        className="bg-slate-700/50 border-slate-600/50 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Energia</label>
                      <Input
                        type="number"
                        value={estEnergia}
                        onChange={(e) => setEstEnergia(Number(e.target.value))}
                        className="bg-slate-700/50 border-slate-600/50 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Pessoal</label>
                      <Input
                        type="number"
                        value={estPessoal}
                        onChange={(e) => setEstPessoal(Number(e.target.value))}
                        className="bg-slate-700/50 border-slate-600/50 text-white"
                      />
                    </div>
                  </div>

                  {/* Resultados */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4">Estimativas por Estadia</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-600">
                            <th className="text-left py-3 px-4 text-slate-300">Dias</th>
                            <th className="text-right py-3 px-4 text-slate-300">Custo Total</th>
                            <th className="text-right py-3 px-4 text-slate-300">Custo/Dia</th>
                            <th className="text-right py-3 px-4 text-slate-300">Economia</th>
                            <th className="text-right py-3 px-4 text-slate-300">% Economia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {estimativasCusto.map((est, index) => (
                            <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                              <td className="py-3 px-4 text-white font-medium">{est.dias}</td>
                              <td className="py-3 px-4 text-right text-white">R$ {est.custoTotal.toFixed(2)}</td>
                              <td className="py-3 px-4 text-right text-blue-400">R$ {est.custoPorDia.toFixed(2)}</td>
                              <td className="py-3 px-4 text-right text-green-400">R$ {est.economia.toFixed(2)}</td>
                              <td className="py-3 px-4 text-right text-green-400">
                                {est.dias > 1 ? `${((est.dias - 1) * 5).toFixed(1)}%` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Gráfico de custos */}
                    <div className="mt-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={estimativasCusto}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="dias" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${value.toFixed(0)}`} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #475569',
                              borderRadius: '8px',
                              color: '#f1f5f9'
                            }}
                            formatter={(value, name) => [
                              `R$ ${Number(value).toFixed(2)}`, 
                              name === 'custoPorDia' ? 'Custo por Dia' : 'Custo Total'
                            ]}
                          />
                          <Line type="monotone" dataKey="custoPorDia" stroke="#3B82F6" strokeWidth={3} name="Custo/Dia" />
                          <Line type="monotone" dataKey="custoTotal" stroke="#10B981" strokeWidth={3} name="Custo Total" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análise de Breakeven */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Análise de Breakeven</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">R$ {(estLimpeza + estAmenities + estLavanderia + estManutencao + estEnergia + estPessoal).toFixed(2)}</div>
                    <div className="text-sm text-slate-400">Custo Mínimo/Dia</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">R$ {((estLimpeza + estAmenities + estLavanderia + estManutencao + estEnergia + estPessoal) * 1.3).toFixed(2)}</div>
                    <div className="text-sm text-slate-400">Preço Breakeven (30%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">R$ {((estLimpeza + estAmenities + estLavanderia + estManutencao + estEnergia + estPessoal) * 1.5).toFixed(2)}</div>
                    <div className="text-sm text-slate-400">Preço Recomendado (50%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">
                      {currentProperty.adr ? `${(((estLimpeza + estAmenities + estLavanderia + estManutencao + estEnergia + estPessoal) / currentProperty.adr) * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div className="text-sm text-slate-400">% do ADR Atual</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
