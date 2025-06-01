import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, Database, FileText, Calendar, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import AutoCSVImporter from './AutoCSVImporter';

interface DataManagementProps {
  propertyId: string;
}

const DataManagement = ({ propertyId }: DataManagementProps) => {
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState<'manual' | 'auto'>('auto');
  
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: 1,
      filename: 'reservas_2024_01.xlsx',
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
      filename: 'historico_vendas.xlsx',
      type: 'vendas',
      uploadDate: '2024-01-06 16:45',
      status: 'completed',
      records: 234,
      errors: 0
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState('reservas');
  const [validationResults, setValidationResults] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const dataTypes = [
    { value: 'reservas', label: 'Dados de Reservas', description: 'Check-ins, check-outs, valores' },
    { value: 'custos', label: 'Dados de Custos', description: 'Custos operacionais e fixos' },
    { value: 'vendas', label: 'Histórico de Vendas', description: 'Dados históricos de receita' },
    { value: 'eventos', label: 'Calendário de Eventos', description: 'Eventos e feriados' },
    { value: 'metas', label: 'Metas de Performance', description: 'Objetivos mensais/anuais' },
    { value: 'concorrencia', label: 'Dados de Concorrência', description: 'Preços e ocupação competitors' },
    { value: 'clientes', label: 'Base de Clientes', description: 'Perfil e histórico de hóspedes' },
    { value: 'canais', label: 'Performance de Canais', description: 'OTAs, direto, agências' },
    { value: 'funcionarios', label: 'Dados de Funcionários', description: 'Escalas e custos de pessoal' },
    { value: 'manutencao', label: 'Manutenção e Facilities', description: 'Custos de manutenção' }
  ];

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Pega a primeira planilha
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Converte para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            reject(new Error('Planilha vazia'));
            return;
          }

          // Primeira linha são os cabeçalhos
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];

          const formattedData = rows
            .filter(row => row.some(cell => cell !== undefined && cell !== ''))
            .map(row => {
              const rowData: any = {};
              headers.forEach((header, index) => {
                rowData[header] = row[index] || '';
              });
              return rowData;
            });

          resolve(formattedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

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

  const validateData = (data: any[], type: string) => {
    let requiredColumns: string[] = [];
    let errors: string[] = [];
    let warnings: string[] = [];

    const columnMappings: { [key: string]: string[] } = {
      'reservas': ['data_checkin', 'data_checkout', 'valor_total', 'quarto_tipo', 'canal_venda'],
      'custos': ['data', 'categoria', 'valor', 'descricao', 'tipo'],
      'vendas': ['data', 'receita', 'quartos_vendidos', 'canal', 'adr'],
      'eventos': ['data_inicio', 'data_fim', 'nome_evento', 'impacto_ocupacao'],
      'metas': ['mes_ano', 'valor_meta', 'tipo_meta'],
      'concorrencia': ['data', 'hotel_concorrente', 'preco_medio', 'ocupacao_estimada'],
      'clientes': ['nome', 'email', 'telefone', 'data_nascimento', 'cidade'],
      'canais': ['canal', 'mes_ano', 'receita', 'reservas', 'comissao'],
      'funcionarios': ['nome', 'cargo', 'salario', 'departamento', 'data_admissao'],
      'manutencao': ['data', 'tipo_servico', 'custo', 'fornecedor', 'status']
    };

    requiredColumns = columnMappings[type] || [];

    // Verificar colunas obrigatórias
    const headers = Object.keys(data[0] || {});
    const missingColumns = requiredColumns.filter(col => 
      !headers.some(header => 
        header.toLowerCase().includes(col.toLowerCase()) || 
        col.toLowerCase().includes(header.toLowerCase())
      )
    );
    
    if (missingColumns.length > 0) {
      warnings.push(`Colunas sugeridas não encontradas: ${missingColumns.join(', ')}`);
    }

    // Verificar dados vazios
    let emptyRows = 0;
    let invalidDates = 0;
    let invalidNumbers = 0;

    data.forEach((row, index) => {
      const values = Object.values(row);
      const emptyFields = values.filter(val => !val || val.toString().trim() === '').length;
      
      if (emptyFields > values.length / 2) {
        emptyRows++;
      }

      // Validações específicas por tipo
      if (type === 'reservas' || type === 'vendas') {
        const dateFields = Object.keys(row).filter(key => key.toLowerCase().includes('data'));
        dateFields.forEach(field => {
          const dateValue = row[field];
          if (dateValue && isNaN(Date.parse(dateValue))) {
            invalidDates++;
          }
        });

        const numberFields = Object.keys(row).filter(key => 
          key.toLowerCase().includes('valor') || 
          key.toLowerCase().includes('preco') ||
          key.toLowerCase().includes('receita')
        );
        numberFields.forEach(field => {
          const numValue = row[field];
          if (numValue && isNaN(parseFloat(numValue.toString().replace(',', '.')))) {
            invalidNumbers++;
          }
        });
      }
    });

    if (emptyRows > 0) {
      warnings.push(`${emptyRows} linhas com muitos dados incompletos`);
    }

    if (invalidDates > 0) {
      warnings.push(`${invalidDates} datas em formato inválido`);
    }

    if (invalidNumbers > 0) {
      warnings.push(`${invalidNumbers} valores numéricos inválidos`);
    }

    // Considerar válido se não há erros críticos
    const isValid = errors.length === 0 && data.length > 0;

    return {
      isValid,
      errors,
      warnings,
      records: data.length,
      columns: headers,
      summary: {
        emptyRows,
        invalidDates,
        invalidNumbers,
        dataQuality: Math.round(((data.length - emptyRows) / data.length) * 100)
      }
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    if (!isExcel && !isCsv) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo Excel (.xlsx/.xls) ou CSV válido.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);

    try {
      let data: any[];
      
      if (isExcel) {
        data = await parseExcelFile(file);
      } else {
        data = await parseCsvFile(file);
      }
      
      setParsedData(data);
      
      const validation = validateData(data, dataType);
      setValidationResults(validation);

      if (validation.isValid) {
        toast({
          title: "Arquivo validado",
          description: `${validation.records} registros válidos encontrados. Qualidade: ${validation.summary.dataQuality}%`,
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
        description: `Não foi possível processar o arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };

  const processUpload = () => {
    if (!selectedFile || !validationResults?.isValid) return;

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
    distributeDataToModules(parsedData, dataType);

    // Limpar estado
    setSelectedFile(null);
    setValidationResults(null);
    setParsedData([]);

    toast({
      title: "Upload iniciado",
      description: `Processando ${validationResults.records} registros de ${dataType}...`,
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
    const storageKey = `${type}_data_${propertyId}`;
    
    try {
      const processedData = {
        data,
        timestamp: new Date().toISOString(),
        propertyId,
        type,
        summary: {
          totalRecords: data.length,
          dateRange: extractDateRange(data, type),
          categories: extractCategories(data, type)
        }
      };

      localStorage.setItem(storageKey, JSON.stringify(processedData));

      // Também salvar um índice geral para facilitar consultas
      const indexKey = `data_index_${propertyId}`;
      const existingIndex = JSON.parse(localStorage.getItem(indexKey) || '{}');
      existingIndex[type] = {
        lastUpdated: new Date().toISOString(),
        records: data.length,
        storageKey
      };
      localStorage.setItem(indexKey, JSON.stringify(existingIndex));

      console.log(`Dados de ${type} distribuídos para propriedade ${propertyId}:`, processedData);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const extractDateRange = (data: any[], type: string) => {
    const dateColumns = Object.keys(data[0] || {}).filter(key => 
      key.toLowerCase().includes('data') || key.toLowerCase().includes('date')
    );
    
    if (dateColumns.length === 0) return null;

    const dates = data
      .map(row => row[dateColumns[0]])
      .filter(date => date && !isNaN(Date.parse(date)))
      .map(date => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) return null;

    return {
      start: dates[0].toISOString().split('T')[0],
      end: dates[dates.length - 1].toISOString().split('T')[0]
    };
  };

  const extractCategories = (data: any[], type: string) => {
    const categoryColumns = Object.keys(data[0] || {}).filter(key => 
      key.toLowerCase().includes('categoria') || 
      key.toLowerCase().includes('tipo') ||
      key.toLowerCase().includes('canal')
    );
    
    if (categoryColumns.length === 0) return [];

    const categories = [...new Set(
      data.map(row => row[categoryColumns[0]]).filter(Boolean)
    )];

    return categories.slice(0, 10); // Limitar a 10 categorias principais
  };

  const downloadTemplate = (type: string) => {
    let headers: string[] = [];
    let sampleData: string[] = [];
    
    const templates: { [key: string]: { headers: string[], sample: string[] } } = {
      'reservas': {
        headers: ['data_checkin', 'data_checkout', 'valor_total', 'quarto_tipo', 'canal_venda', 'status', 'hospedes'],
        sample: ['2024-01-15', '2024-01-17', '850.00', 'Standard', 'Booking.com', 'Confirmada', '2']
      },
      'custos': {
        headers: ['data', 'categoria', 'valor', 'descricao', 'tipo', 'fornecedor'],
        sample: ['2024-01-01', 'Operacional', '1500.00', 'Limpeza', 'Fixo', 'Empresa Limpeza Ltda']
      },
      'vendas': {
        headers: ['data', 'receita', 'quartos_vendidos', 'canal', 'adr', 'ocupacao'],
        sample: ['2024-01-01', '12500.00', '45', 'Direto', '278.00', '75']
      },
      'eventos': {
        headers: ['data_inicio', 'data_fim', 'nome_evento', 'impacto_ocupacao', 'tipo'],
        sample: ['2024-02-14', '2024-02-16', 'Carnaval', 'Alto', 'Feriado']
      },
      'metas': {
        headers: ['mes_ano', 'valor_meta', 'tipo_meta', 'observacoes'],
        sample: ['2024-01', '45000.00', 'Receita', 'Meta conservadora']
      },
      'concorrencia': {
        headers: ['data', 'hotel_concorrente', 'preco_medio', 'ocupacao_estimada', 'fonte'],
        sample: ['2024-01-01', 'Hotel Rival', '320.00', '80', 'OTA Research']
      },
      'clientes': {
        headers: ['nome', 'email', 'telefone', 'data_nascimento', 'cidade', 'segmento'],
        sample: ['João Silva', 'joao@email.com', '11999999999', '1985-03-15', 'São Paulo', 'Executivo']
      },
      'canais': {
        headers: ['canal', 'mes_ano', 'receita', 'reservas', 'comissao', 'adr'],
        sample: ['Booking.com', '2024-01', '25000.00', '89', '18', '280.00']
      },
      'funcionarios': {
        headers: ['nome', 'cargo', 'salario', 'departamento', 'data_admissao'],
        sample: ['Maria Santos', 'Recepcionista', '3500.00', 'Front Office', '2023-06-01']
      },
      'manutencao': {
        headers: ['data', 'tipo_servico', 'custo', 'fornecedor', 'status', 'urgencia'],
        sample: ['2024-01-01', 'Ar Condicionado', '450.00', 'Clima Tech', 'Concluído', 'Normal']
      }
    };

    const template = templates[type] || templates['reservas'];
    headers = template.headers;
    sampleData = template.sample;

    // Criar workbook Excel
    const wb = XLSX.utils.book_new();
    const wsData = [headers, sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Adicionar estilo aos cabeçalhos
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } }
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `template_${type}.xlsx`);
  };

  const exportData = (format: string) => {
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
    const typeData = dataTypes.find(dt => dt.value === type);
    return typeData ? typeData.label : type;
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Modo */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Gestão de Dados - Propriedade: {propertyId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setActiveMode('auto')}
              variant={activeMode === 'auto' ? 'default' : 'outline'}
              className={activeMode === 'auto' ? 'bg-green-600 hover:bg-green-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
            >
              <Zap className="w-4 h-4 mr-2" />
              Importação Automática
            </Button>
            <Button
              onClick={() => setActiveMode('manual')}
              variant={activeMode === 'manual' ? 'default' : 'outline'}
              className={activeMode === 'manual' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Manual
            </Button>
          </div>
          
          <div className="text-sm text-slate-400">
            {activeMode === 'auto' ? (
              <>
                <strong className="text-green-400">Importação Automática:</strong> Validação inteligente, mapeamento flexível de colunas e armazenamento seguro para arquivos CSV estruturados.
              </>
            ) : (
              <>
                <strong className="text-blue-400">Upload Manual:</strong> Upload tradicional com validação básica para diferentes tipos de dados em Excel ou CSV.
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo baseado no modo selecionado */}
      {activeMode === 'auto' ? (
        <AutoCSVImporter propertyId={propertyId} />
      ) : (
        <>
          {/* Upload Manual - Componente Original */}
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Upload Manual de Dados (Excel/CSV)
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
                    {dataTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    {dataTypes.find(t => t.value === dataType)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Arquivo (Excel/CSV)</label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="bg-slate-700/50 border-slate-600/50 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Suporta: .xlsx, .xls, .csv
                  </p>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => downloadTemplate(dataType)}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Template Excel
                  </Button>
                </div>
              </div>

              {validationResults && (
                <div className="mb-4 p-4 bg-slate-700/50 border border-slate-600/50 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Validação do Arquivo</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
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
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">{validationResults.summary?.dataQuality || 0}%</div>
                      <div className="text-xs text-slate-400">Qualidade</div>
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
                        setParsedData([]);
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
        </>
      )}

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
