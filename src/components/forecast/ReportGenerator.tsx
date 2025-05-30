
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Calendar, BarChart3 } from 'lucide-react';
import { useMetas } from '@/hooks/useMetas';
import { useProperties } from '@/hooks/useProperties';
import { useToast } from '@/hooks/use-toast';

const ReportGenerator = () => {
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [reportType, setReportType] = useState('mensal');
  const [isGenerating, setIsGenerating] = useState(false);

  const { obterMetasPropriedade } = useMetas();
  const { properties, getProperty } = useProperties();
  const { toast } = useToast();

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

  const generateMonthlyReport = async () => {
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
      const property = getProperty(selectedProperty);
      const metas = obterMetasPropriedade(selectedProperty, currentYear);
      
      // Dados simulados para o relatório
      const reportData = {
        propriedade: property?.name,
        periodo: `${months.find(m => m.value === selectedPeriod)?.label}/${currentYear}`,
        dados: {
          receita_real: 45000,
          meta: 50000,
          ml_forecast: 48000,
          pace: 47500,
          atingimento: 90.0,
          dias_decorridos: 15,
          dias_total: 30
        }
      };

      // Simular download de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Criar blob simulado do PDF
      const pdfContent = generatePDFContent(reportData);
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_mensal_${selectedProperty}_${selectedPeriod}_${currentYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Relatório gerado",
        description: "O download do relatório foi iniciado",
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

  const generateAnnualReport = async () => {
    if (!selectedProperty) {
      toast({
        title: "Campo obrigatório",
        description: "Selecione a propriedade",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const property = getProperty(selectedProperty);
      const metas = obterMetasPropriedade(selectedProperty, currentYear);
      
      // Dados simulados para relatório anual
      const reportData = {
        propriedade: property?.name,
        ano: currentYear,
        resumo: {
          total_meta: 600000,
          total_real: 540000,
          atingimento_geral: 90.0,
          melhor_mes: 'Junho',
          pior_mes: 'Fevereiro',
          tendencia: 'Crescente'
        }
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pdfContent = generateAnnualPDFContent(reportData);
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_anual_${selectedProperty}_${currentYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Relatório anual gerado",
        description: "O download do relatório foi iniciado",
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório anual",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFContent = (data: any) => {
    // Simulação simples de conteúdo PDF
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(Relatório Mensal - ${data.propriedade}) Tj
0 -20 Td
(Período: ${data.periodo}) Tj
0 -20 Td
(Receita Real: R$ ${data.dados.receita_real.toLocaleString()}) Tj
0 -20 Td
(Meta: R$ ${data.dados.meta.toLocaleString()}) Tj
0 -20 Td
(Atingimento: ${data.dados.atingimento}%) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000199 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
450
%%EOF`;
  };

  const generateAnnualPDFContent = (data: any) => {
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 300
>>
stream
BT
/F1 12 Tf
50 750 Td
(Relatório Anual - ${data.propriedade}) Tj
0 -20 Td
(Ano: ${data.ano}) Tj
0 -30 Td
(RESUMO EXECUTIVO) Tj
0 -20 Td
(Total Meta: R$ ${data.resumo.total_meta.toLocaleString()}) Tj
0 -20 Td
(Total Real: R$ ${data.resumo.total_real.toLocaleString()}) Tj
0 -20 Td
(Atingimento Geral: ${data.resumo.atingimento_geral}%) Tj
0 -20 Td
(Melhor Mês: ${data.resumo.melhor_mes}) Tj
0 -20 Td
(Tendência: ${data.resumo.tendencia}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000199 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
550
%%EOF`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Gerador de Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleções */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Mês (para relatório mensal)
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo de Relatório
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Relatório Mensal</SelectItem>
                  <SelectItem value="anual">Relatório Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={generateMonthlyReport}
              disabled={isGenerating || !selectedProperty || !selectedPeriod}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Relatório Mensal'}
            </Button>

            <Button
              onClick={generateAnnualReport}
              disabled={isGenerating || !selectedProperty}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Relatório Anual'}
            </Button>
          </div>

          {/* Preview de dados */}
          {selectedProperty && (
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <h4 className="text-white font-medium mb-3">Preview dos Dados</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Propriedade:</span>
                  <div className="text-white font-medium">{getProperty(selectedProperty)?.name}</div>
                </div>
                <div>
                  <span className="text-slate-400">Período:</span>
                  <div className="text-white font-medium">
                    {reportType === 'mensal' && selectedPeriod 
                      ? `${months.find(m => m.value === selectedPeriod)?.label}/${currentYear}`
                      : `Ano ${currentYear}`
                    }
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Metas cadastradas:</span>
                  <div className="text-green-400 font-medium">
                    {obterMetasPropriedade(selectedProperty, currentYear).length} metas
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <div className="text-blue-400 font-medium">Pronto para gerar</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre os relatórios */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            Sobre os Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Relatório Mensal</h4>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Comparativo Real vs Meta vs ML Forecast</li>
                <li>• Cálculo do Pace atual</li>
                <li>• Status de atingimento da meta</li>
                <li>• Projeção para fim do mês</li>
                <li>• Gráfico de tendência</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Relatório Anual</h4>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Performance geral do ano</li>
                <li>• Análise de desvios por mês</li>
                <li>• Indicadores de tendência</li>
                <li>• Comparativo entre meses</li>
                <li>• Resumo executivo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
