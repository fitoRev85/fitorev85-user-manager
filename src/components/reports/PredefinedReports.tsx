
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Calendar, FileText, Download, Eye } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useToast } from '@/hooks/use-toast';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  metrics: string[];
  frequency: string;
  category: 'operational' | 'financial' | 'performance';
}

const PredefinedReports = () => {
  const { properties } = useProperties();
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'adr-monthly',
      name: 'ADR Mensal',
      description: 'Average Daily Rate por mês com comparativo ano anterior',
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      metrics: ['ADR', 'Variação %', 'Tendência'],
      frequency: 'Mensal',
      category: 'financial'
    },
    {
      id: 'revpar-analysis',
      name: 'Análise RevPAR',
      description: 'Revenue per Available Room com breakdown por canal',
      icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
      metrics: ['RevPAR', 'Ocupação', 'ADR', 'Por Canal'],
      frequency: 'Mensal',
      category: 'performance'
    },
    {
      id: 'occupancy-trend',
      name: 'Ocupação por Mês',
      description: 'Taxa de ocupação mensal com sazonalidade',
      icon: <Calendar className="w-5 h-5 text-purple-400" />,
      metrics: ['Taxa Ocupação', 'Diárias Vendidas', 'Disponibilidade'],
      frequency: 'Mensal',
      category: 'operational'
    },
    {
      id: 'channel-performance',
      name: 'Performance por Canal',
      description: 'Análise detalhada de performance por canal de distribuição',
      icon: <FileText className="w-5 h-5 text-orange-400" />,
      metrics: ['Receita por Canal', 'ADR por Canal', 'Volume'],
      frequency: 'Mensal',
      category: 'performance'
    },
    {
      id: 'seasonal-analysis',
      name: 'Análise Sazonal',
      description: 'Padrões sazonais de ocupação e tarifas',
      icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
      metrics: ['Sazonalidade', 'Índices', 'Comparativo'],
      frequency: 'Anual',
      category: 'performance'
    },
    {
      id: 'revenue-summary',
      name: 'Resumo de Receita',
      description: 'Consolidado de receita com KPIs principais',
      icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
      metrics: ['Receita Total', 'Crescimento', 'Meta'],
      frequency: 'Mensal',
      category: 'financial'
    }
  ];

  const currentYear = new Date().getFullYear();
  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const generateReport = async (reportId: string, format: 'pdf' | 'excel') => {
    if (!selectedProperty || !selectedPeriod) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione a propriedade e o período",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const report = reportTemplates.find(r => r.id === reportId);
      const property = properties.find(p => p.id === selectedProperty);
      
      toast({
        title: "Relatório gerado",
        description: `${report?.name} em formato ${format.toUpperCase()} foi gerado com sucesso`,
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const previewReport = (reportId: string) => {
    if (!selectedProperty || !selectedPeriod) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione a propriedade e o período",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Preview disponível",
      description: "Visualizando prévia do relatório na aba Preview",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'operational': return 'bg-blue-500/20 text-blue-400';
      case 'financial': return 'bg-green-500/20 text-green-400';
      case 'performance': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Configurações Globais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Propriedade
              </label>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Período (Mês/Ano)
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={`${month.value}-${currentYear}`}>
                      {month.label} {currentYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTemplates.map((report) => (
          <Card key={report.id} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {report.icon}
                  <div>
                    <CardTitle className="text-white text-lg">{report.name}</CardTitle>
                    <Badge className={getCategoryColor(report.category)}>
                      {report.category}
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  {report.frequency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm">{report.description}</p>
              
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-400">MÉTRICAS INCLUÍDAS:</span>
                <div className="flex flex-wrap gap-1">
                  {report.metrics.map((metric, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => previewReport(report.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={isGenerating}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
                
                <Button
                  onClick={() => generateReport(report.id, 'pdf')}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isGenerating}
                >
                  <Download className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                
                <Button
                  onClick={() => generateReport(report.id, 'excel')}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isGenerating}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PredefinedReports;
