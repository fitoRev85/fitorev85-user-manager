
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Settings, Save, Download } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useToast } from '@/hooks/use-toast';

interface CustomReport {
  name: string;
  description: string;
  propertyId: string;
  period: string;
  metrics: string[];
  groupBy: string;
  filters: Record<string, any>;
}

const ReportBuilder = () => {
  const { properties } = useProperties();
  const { toast } = useToast();
  
  const [report, setReport] = useState<CustomReport>({
    name: '',
    description: '',
    propertyId: '',
    period: '',
    metrics: [],
    groupBy: 'month',
    filters: {}
  });

  const availableMetrics = [
    { id: 'revenue', label: 'Receita Total', description: 'Soma de todos os valores de reservas' },
    { id: 'adr', label: 'ADR', description: 'Average Daily Rate - Tarifa média diária' },
    { id: 'revpar', label: 'RevPAR', description: 'Revenue per Available Room' },
    { id: 'occupancy', label: 'Taxa de Ocupação', description: 'Percentual de quartos ocupados' },
    { id: 'bookings', label: 'Número de Reservas', description: 'Quantidade total de reservas' },
    { id: 'nights', label: 'Noites Vendidas', description: 'Total de diárias vendidas' },
    { id: 'avg_stay', label: 'Estadia Média', description: 'Duração média das reservas' },
    { id: 'cancellation_rate', label: 'Taxa de Cancelamento', description: 'Percentual de reservas canceladas' },
    { id: 'lead_time', label: 'Lead Time', description: 'Tempo médio entre reserva e check-in' },
    { id: 'channel_mix', label: 'Mix de Canais', description: 'Distribuição por canal de vendas' }
  ];

  const groupByOptions = [
    { value: 'day', label: 'Por Dia' },
    { value: 'week', label: 'Por Semana' },
    { value: 'month', label: 'Por Mês' },
    { value: 'quarter', label: 'Por Trimestre' },
    { value: 'channel', label: 'Por Canal' },
    { value: 'room_type', label: 'Por Tipo de Quarto' }
  ];

  const periodOptions = [
    { value: 'last_7_days', label: 'Últimos 7 dias' },
    { value: 'last_30_days', label: 'Últimos 30 dias' },
    { value: 'current_month', label: 'Mês atual' },
    { value: 'last_month', label: 'Mês anterior' },
    { value: 'current_quarter', label: 'Trimestre atual' },
    { value: 'current_year', label: 'Ano atual' },
    { value: 'custom', label: 'Período personalizado' }
  ];

  const handleMetricToggle = (metricId: string, checked: boolean) => {
    setReport(prev => ({
      ...prev,
      metrics: checked 
        ? [...prev.metrics, metricId]
        : prev.metrics.filter(m => m !== metricId)
    }));
  };

  const generateReport = async (format: 'pdf' | 'excel') => {
    if (!report.name || !report.propertyId || !report.period || report.metrics.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, propriedade, período e selecione pelo menos uma métrica",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simular geração de relatório customizado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Relatório customizado gerado",
        description: `${report.name} em formato ${format.toUpperCase()} foi gerado com sucesso`,
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório customizado",
        variant: "destructive"
      });
    }
  };

  const saveTemplate = () => {
    if (!report.name) {
      toast({
        title: "Nome obrigatório",
        description: "Informe um nome para o template",
        variant: "destructive"
      });
      return;
    }

    // Salvar template no localStorage
    const templates = JSON.parse(localStorage.getItem('report_templates') || '[]');
    templates.push({ ...report, id: Date.now().toString() });
    localStorage.setItem('report_templates', JSON.stringify(templates));

    toast({
      title: "Template salvo",
      description: "Template de relatório salvo com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      {/* Configurações Básicas */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome do Relatório *
              </label>
              <Input
                value={report.name}
                onChange={(e) => setReport(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Análise Mensal de Performance"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Propriedade *
              </label>
              <Select 
                value={report.propertyId} 
                onValueChange={(value) => setReport(prev => ({ ...prev, propertyId: value }))}
              >
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
                Período *
              </label>
              <Select 
                value={report.period} 
                onValueChange={(value) => setReport(prev => ({ ...prev, period: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Agrupar por
              </label>
              <Select 
                value={report.groupBy} 
                onValueChange={(value) => setReport(prev => ({ ...prev, groupBy: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupByOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descrição
            </label>
            <Textarea
              value={report.description}
              onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o objetivo deste relatório..."
              className="bg-slate-700/50 border-slate-600 text-white"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Métricas */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Métricas Incluídas *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableMetrics.map((metric) => (
              <div key={metric.id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                <Checkbox
                  id={metric.id}
                  checked={report.metrics.includes(metric.id)}
                  onCheckedChange={(checked) => handleMetricToggle(metric.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <label 
                    htmlFor={metric.id} 
                    className="text-sm font-medium text-white cursor-pointer"
                  >
                    {metric.label}
                  </label>
                  <p className="text-xs text-slate-400">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>

          {report.metrics.length > 0 && (
            <div className="mt-4 p-3 bg-slate-700/20 rounded-lg">
              <span className="text-sm font-medium text-slate-300">Métricas selecionadas:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {report.metrics.map((metricId) => {
                  const metric = availableMetrics.find(m => m.id === metricId);
                  return (
                    <Badge key={metricId} className="bg-blue-500/20 text-blue-400">
                      {metric?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={saveTemplate}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Template
            </Button>

            <Button
              onClick={() => generateReport('pdf')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>

            <Button
              onClick={() => generateReport('excel')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar Excel
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Dica:</strong> Use o Report Builder para criar relatórios personalizados com as métricas específicas que você precisa. 
              Salve como template para reutilizar no futuro.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportBuilder;
