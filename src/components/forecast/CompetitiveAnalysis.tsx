import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, Eye, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Cell } from 'recharts';

const CompetitiveAnalysis = () => {
  const [competitorData, setCompetitorData] = useState([
    { name: 'Hotel A', price: 245, occupancy: 82, revpar: 201, availability: 'high' },
    { name: 'Hotel B', price: 280, occupancy: 75, revpar: 210, availability: 'medium' },
    { name: 'Nossa Propriedade', price: 265, occupancy: 78, revpar: 207, availability: 'high' },
    { name: 'Hotel C', price: 220, occupancy: 85, revpar: 187, availability: 'high' },
    { name: 'Hotel D', price: 300, occupancy: 70, revpar: 210, availability: 'low' }
  ]);

  const [priceComparisonData, setPriceComparisonData] = useState([
    { date: '2024-01-01', hotelA: 240, hotelB: 275, nossa: 260, hotelC: 215 },
    { date: '2024-01-02', hotelA: 245, hotelB: 280, nossa: 265, hotelC: 220 },
    { date: '2024-01-03', hotelA: 250, hotelB: 285, nossa: 270, hotelC: 225 },
    { date: '2024-01-04', hotelA: 245, hotelB: 280, nossa: 265, hotelC: 220 },
    { date: '2024-01-05', hotelA: 240, hotelB: 275, nossa: 260, hotelC: 215 },
    { date: '2024-01-06', hotelA: 255, hotelB: 290, nossa: 275, hotelC: 230 },
    { date: '2024-01-07', hotelA: 260, hotelB: 295, nossa: 280, hotelC: 235 }
  ]);

  const [marketPositioning, setMarketPositioning] = useState([
    { hotel: 'Hotel A', price: 245, quality: 85 },
    { hotel: 'Hotel B', price: 280, quality: 90 },
    { hotel: 'Nossa Propriedade', price: 265, quality: 88 },
    { hotel: 'Hotel C', price: 220, quality: 75 },
    { hotel: 'Hotel D', price: 300, quality: 95 }
  ]);

  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Aqui seria feito o processamento do CSV
      console.log('Uploading competitor data:', file.name);
    }
  };

  const exportReport = () => {
    console.log('Exporting competitive analysis report...');
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getBarColor = (entry) => {
    return entry.name === 'Nossa Propriedade' ? '#3b82f6' : '#64748b';
  };

  return (
    <div className="space-y-6">
      {/* Upload e Controles */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            Análise Competitiva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Upload dados CSV</label>
              <div className="relative">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="bg-slate-700/50 border-slate-600/50 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                <Upload className="w-4 h-4 mr-2" />
                Processar Dados
              </Button>
            </div>

            <div className="flex items-end">
              <Button
                onClick={exportReport}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </div>

          {uploadedFile && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <span className="text-green-400">Arquivo carregado: {uploadedFile.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela Comparativa */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Posicionamento Competitivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-4 font-semibold text-white">Hotel</th>
                  <th className="text-right py-3 px-4 font-semibold text-white">Preço Médio</th>
                  <th className="text-right py-3 px-4 font-semibold text-white">Ocupação</th>
                  <th className="text-right py-3 px-4 font-semibold text-white">RevPAR</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Disponibilidade</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Posição</th>
                </tr>
              </thead>
              <tbody>
                {competitorData
                  .sort((a, b) => b.revpar - a.revpar)
                  .map((hotel, index) => (
                  <tr key={hotel.name} className={`border-b border-slate-700 ${hotel.name === 'Nossa Propriedade' ? 'bg-blue-500/20' : ''}`}>
                    <td className="py-3 px-4 font-medium text-white">{hotel.name}</td>
                    <td className="py-3 px-4 text-right text-white">R$ {hotel.price}</td>
                    <td className="py-3 px-4 text-right text-white">{hotel.occupancy}%</td>
                    <td className="py-3 px-4 text-right text-white">R$ {hotel.revpar}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(hotel.availability)}`}>
                        {hotel.availability.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-slate-500/20 text-slate-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-600/20 text-slate-400'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos Comparativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Tendência de Preços</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }} 
                />
                <Line type="monotone" dataKey="hotelA" stroke="#ef4444" strokeWidth={2} name="Hotel A" />
                <Line type="monotone" dataKey="hotelB" stroke="#f59e0b" strokeWidth={2} name="Hotel B" />
                <Line type="monotone" dataKey="nossa" stroke="#3b82f6" strokeWidth={3} name="Nossa Propriedade" />
                <Line type="monotone" dataKey="hotelC" stroke="#10b981" strokeWidth={2} name="Hotel C" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Posicionamento Preço vs Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={marketPositioning}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="price" stroke="#94a3b8" name="Preço" />
                <YAxis dataKey="quality" stroke="#94a3b8" name="Qualidade" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                  formatter={(value, name) => [value, name === 'price' ? 'Preço' : 'Qualidade']}
                />
                <Scatter 
                  dataKey="quality" 
                  fill="#3b82f6"
                  name="Hotéis"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* RevPAR Comparison */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Comparação RevPAR</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={competitorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }} 
              />
              <Bar dataKey="revpar" name="RevPAR">
                {competitorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitiveAnalysis;
