
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, Database, FileText, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataManagementProps {
  propertyId: string;
}

const DataManagement = ({ propertyId }: DataManagementProps) => {
  const { toast } = useToast();
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: 1,
      filename: 'reservas_2024_01.csv',
      type: 'reservas',
      uploadDate: '2024-01-07 10:30',
      status: 'processed',
      records: 156,
      errors: 0
    },
    {
      id: 2,
      filename: 'custos_operacionais.csv',
      type: 'custos',
      uploadDate: '2024-01-07 09:15',
      status: 'processing',
      records: 89,
      errors: 2
    },
    {
      id: 3,
      filename: 'eventos_2024.csv',
      type: 'eventos',
      uploadDate: '2024-01-06 16:45',
      status: 'completed',
      records: 67,
      errors: 0
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState('reservas');
  const [validationResults, setValidationResults] = useState<any>(null);
  const [csvData, setCsvData] = useState<any[]>([]);

  const parseCsvFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          const data = lines.slice(1)
            .filter(line => line.trim() !== '')
            .map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row: any = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const validateCsvData = (data: any[], type: string) => {
    let requiredColumns: string[] = [];
    let errors: string[] = [];
    let warnings: string[] = [];

    switch (type) {
      case 'reservas':
        requiredColumns = ['data_checkin', 'data_checkout', 'valor_total', 'quarto_tipo'];
        break;
      case 'custos':
        requiredColumns = ['data', 'categoria', 'valor', 'descricao'];
        break;
      case 'eventos':
        requiredColumns = ['data_inicio', 'data_fim', 'nome_evento', 'impacto_ocupacao'];
        break;
      case 'metas':
        requiredColumns = ['mes_ano', 'valor_meta', 'tipo_meta'];
        break;
      default:
        requiredColumns = [];
    }

    // Verificar colunas obrigatórias
    const headers = Object.keys(data[0] || {});
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push(`Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`);
    }

    // Verificar dados vazios
    let emptyRows = 0;
    data.forEach((row, index) => {
      const emptyFields = requiredColumns.filter(col => !row[col] || row[col].toString().trim() === '');
      if (emptyFields.length > 0) {
        emptyRows++;
      }
    });

    if (emptyRows > 0) {
      warnings.push(`${emptyRows} linhas com dados incompletos`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      records: data.length,
      columns: headers
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);

    try {
      const data = await parseCsvFile(file);
      setCsvData(data);
      
      const validation = validateCsvData(data, dataType);
      setValidationResults(validation);

      if (validation.isValid) {
        toast({
          title: "Arquivo validado",
          description: `${validation.records} registros válidos encontrados.`,
        });
      } else {
        toast({
          title: "Problemas encontrados",
          description: `${validation.errors.length} erros e ${validation.warnings.length} avisos.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar o arquivo CSV.",
        variant: "destructive"
      });
    }
  };

  const processUpload = () => {
    if (!selectedFile || !validationResults?.isValid) return;

    // Simular processamento e distribuição dos dados
    const newUpload = {
      id: Date.now(),
      filename: selectedFile.name,
      type: dataType,
      uploadDate: new Date().toLocaleString('pt-BR'),
      status: 'processing' as const,
      records: validationResults.records,
      errors: validationResults.errors.length
    };

    setUploadHistory([newUpload, ...uploadHistory]);

    // Distribuir dados para os módulos apropriados
    distributeDataToModules(csvData, dataType);

    // Limpar estado
    setSelectedFile(null);
    setValidationResults(null);
    setCsvData([]);

    toast({
      title: "Upload iniciado",
      description: `Processando ${validationResults.records} registros...`,
    });

    // Simular conclusão do processamento
    setTimeout(() => {
      setUploadHistory(prev => prev.map(upload =>
        upload.id === newUpload.id ? { ...upload, status: 'completed' as const } : upload
      ));
      
      toast({
        title: "Upload concluído",
        description: "Dados processados e distribuídos aos módulos.",
      });
    }, 3000);
  };

  const distributeDataToModules = (data: any[], type: string) => {
    // Salvar dados no localStorage para que outros módulos possam acessar
    const storageKey = `${type}_data_${propertyId}`;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        propertyId
      }));

      console.log(`Dados de ${type} distribuídos para propriedade ${propertyId}:`, data);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const downloadTemplate = (type: string) => {
    let csvContent = '';
    
    switch (type) {
      case 'reservas':
        csvContent = 'data_checkin,data_checkout,valor_total,quarto_tipo,canal_venda,status\n2024-01-15,2024-01-17,850.00,Standard,Booking.com,Confirmada';
        break;
      case 'custos':
        csvContent = 'data,categoria,valor,descricao,tipo\n2024-01-01,Operacional,1500.00,Limpeza,Fixo';
        break;
      case 'eventos':
        csvContent = 'data_inicio,data_fim,nome_evento,impacto_ocupacao,tipo\n2024-02-14,2024-02-16,Carnaval,Alto,Feriado';
        break;
      case 'metas':
        csvContent = 'mes_ano,valor_meta,tipo_meta,observacoes\n2024-01,45000.00,Receita,Meta conservadora';
        break;
      default:
        csvContent = 'coluna1,coluna2,coluna3\nvalor1,valor2,valor3';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportData = (format: string) => {
    // Simular exportação
    toast({
      title: "Exportação iniciada",
      description: `Gerando arquivo ${format.toUpperCase()}...`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reservas': return 'Reservas';
      case 'custos': return 'Custos';
      case 'eventos': return 'Eventos';
      case 'metas': return 'Metas';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload de Dados */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Upload de Dados CSV - Propriedade: {propertyId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Dados</label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full bg-slate-700/50 border-slate-600/50 text-white rounded-lg px-3 py-2"
              >
                <option value="reservas">Dados de Reservas</option>
                <option value="custos">Dados de Custos</option>
                <option value="eventos">Calendário de Eventos</option>
                <option value="metas">Metas de Performance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Arquivo CSV</label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="bg-slate-700/50 border-slate-600/50 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => downloadTemplate(dataType)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>
          </div>

          {validationResults && (
            <div className="mb-4 p-4 bg-slate-700/50 border border-slate-600/50 rounded-lg">
              <h4 className="text-white font-medium mb-3">Validação do Arquivo</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{validationResults.records}</div>
                  <div className="text-xs text-slate-400">Registros</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{validationResults.columns.length}</div>
                  <div className="text-xs text-slate-400">Colunas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{validationResults.errors.length}</div>
                  <div className="text-xs text-slate-400">Erros</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{validationResults.warnings.length}</div>
                  <div className="text-xs text-slate-400">Avisos</div>
                </div>
              </div>

              {validationResults.errors.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-red-400 mb-1">Erros:</div>
                  {validationResults.errors.map((error: string, index: number) => (
                    <div key={index} className="text-sm text-red-300">• {error}</div>
                  ))}
                </div>
              )}

              {validationResults.warnings.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-yellow-400 mb-1">Avisos:</div>
                  {validationResults.warnings.map((warning: string, index: number) => (
                    <div key={index} className="text-sm text-yellow-300">• {warning}</div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={processUpload}
                  disabled={!validationResults.isValid}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Processar Upload
                </Button>
                <Button
                  onClick={() => {
                    setValidationResults(null);
                    setSelectedFile(null);
                    setCsvData([]);
                  }}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Uploads */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-green-400" />
            Histórico de Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-4 font-semibold text-white">Arquivo</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Data</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Registros</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Erros</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map((upload) => (
                  <tr key={upload.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">{upload.filename}</td>
                    <td className="py-3 px-4 text-slate-300">{getTypeLabel(upload.type)}</td>
                    <td className="py-3 px-4 text-slate-300">{upload.uploadDate}</td>
                    <td className="py-3 px-4 text-center text-white">{upload.records}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={upload.errors > 0 ? 'text-red-400' : 'text-green-400'}>
                        {upload.errors}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(upload.status)}
                        <span className={`text-sm ${getStatusColor(upload.status)}`}>
                          {upload.status === 'completed' ? 'Concluído' :
                           upload.status === 'processing' ? 'Processando' :
                           upload.status === 'error' ? 'Erro' : upload.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Exportação de Dados */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Exportação de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => exportData('csv')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            
            <Button
              onClick={() => exportData('pdf')}
              className="bg-red-600 hover:bg-red-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Relatório PDF
            </Button>
            
            <Button
              onClick={() => exportData('excel')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Planilha Excel
            </Button>
            
            <Button
              onClick={() => exportData('json')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Dados JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas dos Dados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Total de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {uploadHistory.reduce((sum, upload) => sum + upload.records, 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">Propriedade {propertyId}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Uploads Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {uploadHistory.filter(u => u.status === 'completed').length}
            </div>
            <p className="text-xs text-slate-400">Este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {uploadHistory.length > 0 ? 
                Math.round((uploadHistory.filter(u => u.status === 'completed').length / uploadHistory.length) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-slate-400">Processamento sem erros</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataManagement;
