
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle, CreditCard, Percent, DollarSign } from 'lucide-react';

const OTAManagement = () => {
  const [editingOTA, setEditingOTA] = useState(null);

  const otaData = [
    {
      id: 1,
      name: 'Booking.com',
      commission: 15.0,
      volume: 320000,
      bookings: 1250,
      avgCommission: 48.50,
      status: 'active',
      paymentTerms: '15 dias',
      category: 'premium'
    },
    {
      id: 2,
      name: 'Expedia',
      commission: 18.0,
      volume: 280000,
      bookings: 980,
      avgCommission: 51.43,
      status: 'active',
      paymentTerms: '30 dias',
      category: 'premium'
    },
    {
      id: 3,
      name: 'Airbnb',
      commission: 12.0,
      volume: 150000,
      bookings: 450,
      avgCommission: 40.00,
      status: 'active',
      paymentTerms: '7 dias',
      category: 'standard'
    },
    {
      id: 4,
      name: 'Agoda',
      commission: 16.5,
      volume: 95000,
      bookings: 320,
      avgCommission: 47.85,
      status: 'active',
      paymentTerms: '21 dias',
      category: 'standard'
    },
    {
      id: 5,
      name: 'Hotels.com',
      commission: 20.0,
      volume: 85000,
      bookings: 280,
      avgCommission: 60.71,
      status: 'review',
      paymentTerms: '45 dias',
      category: 'high-cost'
    }
  ];

  const totalCommissions = otaData.reduce((sum, ota) => sum + (ota.volume * ota.commission / 100), 0);
  const totalVolume = otaData.reduce((sum, ota) => sum + ota.volume, 0);
  const avgCommissionRate = (totalCommissions / totalVolume) * 100;

  const monthlyTrend = [
    { month: 'Jan', booking: 45000, expedia: 38000, airbnb: 22000, others: 15000 },
    { month: 'Fev', booking: 48000, expedia: 42000, airbnb: 25000, others: 18000 },
    { month: 'Mar', booking: 52000, expedia: 45000, airbnb: 28000, others: 20000 },
    { month: 'Abr', booking: 48000, expedia: 40000, airbnb: 26000, others: 17000 },
    { month: 'Mai', booking: 55000, expedia: 48000, airbnb: 30000, others: 22000 },
    { month: 'Jun', booking: 51000, expedia: 46000, airbnb: 27000, others: 19000 }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Ativo</Badge>;
      case 'review':
        return <Badge className="bg-orange-600">Em Revisão</Badge>;
      case 'inactive':
        return <Badge className="bg-red-600">Inativo</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'premium':
        return <Badge variant="outline" className="border-blue-500 text-blue-400">Premium</Badge>;
      case 'standard':
        return <Badge variant="outline" className="border-gray-500 text-gray-400">Standard</Badge>;
      case 'high-cost':
        return <Badge variant="outline" className="border-red-500 text-red-400">Alto Custo</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Gestão de OTAs e Operadoras</h2>
          <p className="text-gray-400">Controle de comissões, volumes e performance dos canais de distribuição</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar OTA
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Volume Total OTAs</p>
                <p className="text-xl font-bold text-blue-400">
                  R$ {totalVolume.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">+8% vs mês anterior</span>
                </div>
              </div>
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Comissões Pagas</p>
                <p className="text-xl font-bold text-red-400">
                  R$ {totalCommissions.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">+12% vs mês anterior</span>
                </div>
              </div>
              <CreditCard className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Taxa Média</p>
                <p className="text-xl font-bold text-orange-400">
                  {avgCommissionRate.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">-0.5% vs mês anterior</span>
                </div>
              </div>
              <Percent className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">OTAs Ativas</p>
                <p className="text-xl font-bold text-green-400">
                  {otaData.filter(ota => ota.status === 'active').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {otaData.filter(ota => ota.status === 'review').length} em revisão
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Evolução de Volume por OTA</CardTitle>
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
              <Line type="monotone" dataKey="booking" stroke="#3B82F6" strokeWidth={2} name="Booking.com" />
              <Line type="monotone" dataKey="expedia" stroke="#10B981" strokeWidth={2} name="Expedia" />
              <Line type="monotone" dataKey="airbnb" stroke="#F59E0B" strokeWidth={2} name="Airbnb" />
              <Line type="monotone" dataKey="others" stroke="#EF4444" strokeWidth={2} name="Outros" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de OTAs */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Lista de OTAs e Operadoras</CardTitle>
            <div className="flex gap-2">
              <Input 
                placeholder="Buscar OTA..." 
                className="bg-gray-800 border-gray-700 text-white w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">OTA / Operadora</TableHead>
                <TableHead className="text-gray-400">Taxa (%)</TableHead>
                <TableHead className="text-gray-400">Volume</TableHead>
                <TableHead className="text-gray-400">Reservas</TableHead>
                <TableHead className="text-gray-400">Comissão Média</TableHead>
                <TableHead className="text-gray-400">Categoria</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Prazo Pag.</TableHead>
                <TableHead className="text-gray-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otaData.map((ota) => (
                <TableRow key={ota.id} className="border-gray-800">
                  <TableCell className="text-white font-medium">{ota.name}</TableCell>
                  <TableCell className="text-red-400 font-bold">{ota.commission}%</TableCell>
                  <TableCell className="text-blue-400">R$ {ota.volume.toLocaleString()}</TableCell>
                  <TableCell className="text-gray-300">{ota.bookings}</TableCell>
                  <TableCell className="text-orange-400">R$ {ota.avgCommission.toFixed(2)}</TableCell>
                  <TableCell>{getCategoryBadge(ota.category)}</TableCell>
                  <TableCell>{getStatusBadge(ota.status)}</TableCell>
                  <TableCell className="text-gray-300">{ota.paymentTerms}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => setEditingOTA(ota.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Análise de Performance */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Performance por Comissão</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={otaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Bar dataKey="commission" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Volume vs Comissão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {otaData.slice(0, 5).map((ota, index) => {
                const volumePercentage = (ota.volume / totalVolume) * 100;
                const commissionCost = (ota.volume * ota.commission / 100);
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" 
                           style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index] }} />
                      <span className="text-white font-medium">{ota.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300">{volumePercentage.toFixed(1)}% do volume</p>
                      <p className="text-red-400 text-sm">R$ {commissionCost.toLocaleString()} em comissão</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTAManagement;
