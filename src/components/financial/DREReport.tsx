
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Download, Edit, Plus, AlertCircle } from 'lucide-react';

const DREReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const dreData = {
    receitas: {
      hospedagem: 750000,
      restaurante: 45000,
      eventos: 35000,
      outros: 20000,
      total: 850000
    },
    custosVariaveis: {
      comissoes: 85000,
      amenities: 15000,
      lavanderia: 12000,
      outros: 8000,
      total: 120000
    },
    custosFixos: {
      pessoal: 280000,
      energia: 45000,
      agua: 18000,
      telefone: 8000,
      internet: 12000,
      seguros: 15000,
      manutencao: 35000,
      marketing: 25000,
      administrativo: 42000,
      total: 480000
    }
  };

  const lucroOperacional = dreData.receitas.total - dreData.custosVariaveis.total - dreData.custosFixos.total;
  const margemOperacional = (lucroOperacional / dreData.receitas.total) * 100;

  const chartData = [
    { name: 'Receitas', value: dreData.receitas.total, color: '#10B981' },
    { name: 'Custos Variáveis', value: dreData.custosVariaveis.total, color: '#F59E0B' },
    { name: 'Custos Fixos', value: dreData.custosFixos.total, color: '#EF4444' },
    { name: 'Lucro Operacional', value: lucroOperacional, color: '#3B82F6' }
  ];

  const receitasDetalhadas = [
    { categoria: 'Hospedagem', valor: dreData.receitas.hospedagem, percentual: (dreData.receitas.hospedagem / dreData.receitas.total) * 100 },
    { categoria: 'Restaurante', valor: dreData.receitas.restaurante, percentual: (dreData.receitas.restaurante / dreData.receitas.total) * 100 },
    { categoria: 'Eventos', valor: dreData.receitas.eventos, percentual: (dreData.receitas.eventos / dreData.receitas.total) * 100 },
    { categoria: 'Outros', valor: dreData.receitas.outros, percentual: (dreData.receitas.outros / dreData.receitas.total) * 100 }
  ];

  const custosDetalhados = [
    { categoria: 'Pessoal', valor: dreData.custosFixos.pessoal, tipo: 'Fixo', percentual: (dreData.custosFixos.pessoal / dreData.receitas.total) * 100 },
    { categoria: 'Comissões OTA', valor: dreData.custosVariaveis.comissoes, tipo: 'Variável', percentual: (dreData.custosVariaveis.comissoes / dreData.receitas.total) * 100 },
    { categoria: 'Energia', valor: dreData.custosFixos.energia, tipo: 'Fixo', percentual: (dreData.custosFixos.energia / dreData.receitas.total) * 100 },
    { categoria: 'Administrativo', valor: dreData.custosFixos.administrativo, tipo: 'Fixo', percentual: (dreData.custosFixos.administrativo / dreData.receitas.total) * 100 },
    { categoria: 'Manutenção', valor: dreData.custosFixos.manutencao, tipo: 'Fixo', percentual: (dreData.custosFixos.manutencao / dreData.receitas.total) * 100 },
    { categoria: 'Marketing', valor: dreData.custosFixos.marketing, tipo: 'Fixo', percentual: (dreData.custosFixos.marketing / dreData.receitas.total) * 100 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header com Controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">DRE - Demonstrativo de Resultado</h2>
          <p className="text-gray-400">Análise detalhada de receitas, custos e resultado operacional</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Exportar DRE
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Entrada
          </Button>
        </div>
      </div>

      {/* Cards de Resumo DRE */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Receita Bruta</p>
              <p className="text-xl font-bold text-green-400">
                R$ {dreData.receitas.total.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">100% da receita</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Custos Variáveis</p>
              <p className="text-xl font-bold text-orange-400">
                R$ {dreData.custosVariaveis.total.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((dreData.custosVariaveis.total / dreData.receitas.total) * 100).toFixed(1)}% da receita
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Custos Fixos</p>
              <p className="text-xl font-bold text-red-400">
                R$ {dreData.custosFixos.total.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((dreData.custosFixos.total / dreData.receitas.total) * 100).toFixed(1)}% da receita
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Lucro Operacional</p>
              <p className="text-xl font-bold text-blue-400">
                R$ {lucroOperacional.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {margemOperacional.toFixed(1)}% margem
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        
        {/* Gráfico de Composição */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Composição Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
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
                  formatter={(value) => [`R$ ${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Receitas */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Distribuição de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={receitasDetalhadas}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="valor"
                  nameKey="categoria"
                >
                  {receitasDetalhadas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#F59E0B', '#EF4444'][index]} />
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

      {/* Tabela Detalhada de DRE */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">DRE Detalhado</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-green-500 text-green-400">
                Período: Junho 2024
              </Badge>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Receitas */}
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-3">RECEITAS</h3>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Categoria</TableHead>
                    <TableHead className="text-gray-400 text-right">Valor</TableHead>
                    <TableHead className="text-gray-400 text-right">% do Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receitasDetalhadas.map((item, index) => (
                    <TableRow key={index} className="border-gray-800">
                      <TableCell className="text-gray-300">{item.categoria}</TableCell>
                      <TableCell className="text-right text-green-400 font-medium">
                        R$ {item.valor.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-gray-400">
                        {item.percentual.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-gray-700 border-t-2">
                    <TableCell className="font-bold text-green-400">TOTAL RECEITAS</TableCell>
                    <TableCell className="text-right font-bold text-green-400">
                      R$ {dreData.receitas.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-400">100.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Custos */}
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-3">CUSTOS E DESPESAS</h3>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Categoria</TableHead>
                    <TableHead className="text-gray-400">Tipo</TableHead>
                    <TableHead className="text-gray-400 text-right">Valor</TableHead>
                    <TableHead className="text-gray-400 text-right">% da Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {custosDetalhados.map((item, index) => (
                    <TableRow key={index} className="border-gray-800">
                      <TableCell className="text-gray-300">{item.categoria}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={item.tipo === 'Fixo' ? 'border-red-500 text-red-400' : 'border-orange-500 text-orange-400'}
                        >
                          {item.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-red-400 font-medium">
                        R$ {item.valor.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-gray-400">
                        {item.percentual.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-gray-700 border-t-2">
                    <TableCell className="font-bold text-red-400">TOTAL CUSTOS</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold text-red-400">
                      R$ {(dreData.custosVariaveis.total + dreData.custosFixos.total).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-400">
                      {(((dreData.custosVariaveis.total + dreData.custosFixos.total) / dreData.receitas.total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Resultado */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-400">RESULTADO OPERACIONAL</h3>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-400">
                    R$ {lucroOperacional.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Margem: {margemOperacional.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DREReport;
