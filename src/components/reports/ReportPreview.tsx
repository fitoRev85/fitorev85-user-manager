
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Download, Printer, Eye } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useReservationData } from '@/hooks/useReservationData';

const ReportPreview = () => {
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedReport, setSelectedReport] = useState('adr-monthly');
  const { data: reservations } = useReservationData(selectedProperty || '1');

  // Dados simulados para preview
  const mockData = {
    'adr-monthly': {
      title: 'Relatório ADR Mensal',
      subtitle: 'Average Daily Rate - Dezembro 2024',
      data: [
        { month: 'Jan', adr: 150, previousYear: 140, variance: 7.1 },
        { month: 'Fev', adr: 165, previousYear: 155, variance: 6.5 },
        { month: 'Mar', adr: 180, previousYear: 170, variance: 5.9 },
        { month: 'Abr', adr: 175, previousYear: 165, variance: 6.1 },
        { month: 'Mai', adr: 190, previousYear: 180, variance: 5.6 },
        { month: 'Jun', adr: 220, previousYear: 200, variance: 10.0 }
      ],
      metrics: {
        currentADR: 'R$ 180,50',
        previousADR: 'R$ 168,33',
        variance: '+7.2%',
        trend: 'Crescente'
      }
    },
    'revpar-analysis': {
      title: 'Análise RevPAR',
      subtitle: 'Revenue per Available Room - Dezembro 2024',
      data: [
        { channel: 'Booking.com', revpar: 145, occupancy: 75, adr: 193 },
        { channel: 'Airbnb', revpar: 120, occupancy: 68, adr: 176 },
        { channel: 'Expedia', revpar: 110, occupancy: 65, adr: 169 },
        { channel: 'Direto', revpar: 165, occupancy: 80, adr: 206 }
      ],
      metrics: {
        totalRevPAR: 'R$ 135,00',
        avgOccupancy: '72%',
        avgADR: 'R$ 186,00',
        bestChannel: 'Direto'
      }
    }
  };

  const currentData = mockData[selectedReport as keyof typeof mockData];

  if (!currentData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-8 text-center">
          <Eye className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Selecione um relatório</h3>
          <p className="text-slate-400">Escolha uma propriedade e um tipo de relatório para visualizar o preview</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Preview de Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue placeholder="Selecione a propriedade" />
              </SelectTrigger>
              <SelectContent>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adr-monthly">ADR Mensal</SelectItem>
                <SelectItem value="revpar-analysis">Análise RevPAR</SelectItem>
                <SelectItem value="occupancy-trend">Ocupação por Mês</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview do Relatório */}
      <Card className="bg-white text-black">
        <CardContent className="p-8">
          {/* Cabeçalho do Relatório */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentData.title}</h1>
                <p className="text-gray-600 mt-1">{currentData.subtitle}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Propriedade: {properties.find(p => p.id === selectedProperty)?.name || 'Todas as propriedades'}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
                <p>Sistema RMS Hotelaria</p>
              </div>
            </div>
          </div>

          {/* KPIs Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(currentData.metrics).map(([key, value]) => (
              <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Gráfico */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise Gráfica</h3>
            <div className="h-64 bg-gray-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                {selectedReport === 'adr-monthly' ? (
                  <LineChart data={currentData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="adr" stroke="#2563eb" strokeWidth={2} name="ADR Atual" />
                    <Line type="monotone" dataKey="previousYear" stroke="#64748b" strokeWidth={2} name="ADR Anterior" />
                  </LineChart>
                ) : (
                  <BarChart data={currentData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revpar" fill="#2563eb" name="RevPAR" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabela de Dados */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Detalhados</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedReport === 'adr-monthly' ? (
                    <>
                      <TableHead>Mês</TableHead>
                      <TableHead>ADR Atual</TableHead>
                      <TableHead>ADR Anterior</TableHead>
                      <TableHead>Variação %</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Canal</TableHead>
                      <TableHead>RevPAR</TableHead>
                      <TableHead>Ocupação</TableHead>
                      <TableHead>ADR</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.data.map((row: any, index: number) => (
                  <TableRow key={index}>
                    {selectedReport === 'adr-monthly' ? (
                      <>
                        <TableCell>{row.month}</TableCell>
                        <TableCell>R$ {row.adr}</TableCell>
                        <TableCell>R$ {row.previousYear}</TableCell>
                        <TableCell className={row.variance > 0 ? 'text-green-600' : 'text-red-600'}>
                          {row.variance > 0 ? '+' : ''}{row.variance}%
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{row.channel}</TableCell>
                        <TableCell>R$ {row.revpar}</TableCell>
                        <TableCell>{row.occupancy}%</TableCell>
                        <TableCell>R$ {row.adr}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Rodapé */}
          <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
            <p>Este relatório foi gerado automaticamente pelo Sistema RMS Hotelaria</p>
            <p>Para dúvidas ou suporte, entre em contato com a equipe técnica</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportPreview;
