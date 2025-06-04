
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, Database, FileText, Calendar, CheckCircle, AlertCircle, Clock, Zap, Settings, BarChart3, History, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import AutoCSVImporter from './AutoCSVImporter';
import AdvancedDataImporter from './AdvancedDataImporter';

interface DataManagementProps {
  propertyId: string;
}

interface DataSummary {
  type: string;
  label: string;
  records: number;
  lastUpdated: string;
  quality: number;
  status: 'active' | 'outdated' | 'missing';
}

const DataManagement = ({ propertyId }: DataManagementProps) => {
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState<'advanced' | 'auto' | 'manual' | 'analytics'>('advanced');
  
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: 1,
      filename: 'reservas_janeiro_2024.xlsx',
      type: 'reservas',
      uploadDate: '2024-01-15 14:30',
      status: 'completed',
      records: 1256,
      errors: 0,
      quality: 98,
      size: '2.1 MB',
      user: 'João Silva'
    },
    {
      id: 2,
      filename: 'custos_operacionais_q1.csv',
      type: 'custos',
      uploadDate: '2024-01-10 11:20',
      status: 'completed',
      records: 289,
      errors: 5,
      quality: 94,
      size: '456 KB',
      user: 'Maria Santos'
    },
    {
      id: 3,
      filename: 'vendas_dezembro.xlsx',
      type: 'vendas',
      uploadDate: '2024-01-05 16:45',
      status: 'completed',
      records: 534,
      errors: 12,
      quality: 87,
      size: '1.8 MB',
      user: 'Carlos Costa'
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState('reservas');
  const [validationResults, setValidationResults] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [dataSummary, setDataSummary] = useState<DataSummary[]>([]);

  React.useEffect(() => {
    loadDataSummary();
  }, [propertyId]);

  const loadDataSummary = () => {
    const summary: DataSummary[] = [
      {
        type: 'reservas',
        label: 'Dados de Reservas',
        records: localStorage.getItem(`forecast_data_${propertyId}_index`) ? 1256 : 0,
        lastUpdated: '2024-01-15',
        quality: 98,
        status: 'active'
      },
      {
        type: 'custos',
        label: 'Custos Operacionais',
        records: localStorage.getItem(`custos_data_${propertyId}`) ? 289 : 0,
        lastUpdated: '2024-01-10',
        quality: 94,
        status: 'active'
      },
      {
        type: 'vendas',
        label: 'Histórico de Vendas',
        records: localStorage.getItem(`vendas_data_${propertyId}`) ? 534 : 0,
        lastUpdated: '2024-01-05',
        quality: 87,
        status: 'outdated'
      },
      {
        type: 'concorrencia',
        label: 'Dados de Concorrência',
        records: 0,
        lastUpdated: 'Nunca',
        quality: 0,
        status: 'missing'
      }
    ];
    
    setDataSummary(summary);
  };

  const dataTypes = [
    { value: 'reservas', label: 'Dados de Reservas', description: 'Check-ins, check-outs, valores', icon: '🏨' },
    { value: 'custos', label: 'Dados de Custos', description: 'Custos operacionais e fixos', icon: '💰' },
    { value: 'vendas', label: 'Histórico de Vendas', description: 'Dados históricos de receita', icon: '📈' },
    { value: 'eventos', label: 'Calendário de Eventos', description: 'Eventos e feriados', icon: '📅' },
    { value: 'metas', label: 'Metas de Performance', description: 'Objetivos mensais/anuais', icon: '🎯' },
    { value: 'concorrencia', label: 'Dados de Concorrência', description: 'Preços e ocupação competitors', icon: '⚔️' },
    { value: 'clientes', label: 'Base de Clientes', description: 'Perfil e histórico de hóspedes', icon: '👥' },
    { value: 'canais', label: 'Performance de Canais', description: 'OTAs, direto, agências', icon: '🌐' },
    { value: 'funcionarios', label: 'Dados de Funcionários', description: 'Escalas e custos de pessoal', icon: '👷' },
    { value: 'manutencao', label: 'Manutenção e Facilities', description: 'Custos de manutenção', icon: '🔧' }
  ];

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            reject(new Error('Planilha vazia'));
            return;
          }

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

    let emptyRows = 0;
    let invalidDates = 0;
    let invalidNumbers = 0;
    let duplicateIds = 0;

    const seenIds = new Set();

    data.forEach((row, index) => {
      const values = Object.values(row);
      const emptyFields = values.filter(val => !val || val.toString().trim() === '').length;
      
      if (emptyFields > values.length / 2) {
        emptyRows++;
      }

      // Verificar IDs duplicados
      if (row.id || row.booking_id || row.reservation_id) {
        const id = row.id || row.booking_id || row.reservation_id;
        if (seenIds.has(id)) {
          duplicateIds++;
        } else {
          seenIds.add(id);
        }
      }

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

    if (duplicateIds > 0) {
      warnings.push(`${duplicateIds} IDs duplicados encontrados`);
    }

    if (invalidDates > 0) {
      warnings.push(`${invalidDates} datas em formato inválido`);
    }

    if (invalidNumbers > 0) {
      warnings.push(`${invalidNumbers} valores numéricos inválidos`);
    }

    const isValid = errors.length === 0 && data.length > 0;
    const dataQuality = Math.round(((data.length - emptyRows - duplicateIds) / data.length) * 100);

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
        duplicateIds,
        dataQuality,
        uniqueRecords: data.length - duplicateIds
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
      errors: validationResults.errors.length,
      quality: validationResults.summary.dataQuality,
      size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
      user: 'Usuário Atual'
    };

    setUploadHistory([newUpload, ...uploadHistory]);
    distributeDataToModules(parsedData, dataType);

    setSelectedFile(null);
    setValidationResults(null);
    setParsedData([]);

    toast({
      title: "Upload iniciado",
      description: `Processando ${validationResults.records} registros de ${dataType}...`,
    });

    setTimeout(() => {
      setUploadHistory(prev => prev.map(upload =>
        upload.id === newUpload.id ? { ...upload, status: 'completed' as const } : upload
      ));
      
      loadDataSummary(); // Atualizar resumo dos dados
      
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
          categories: extractCategories(data, type),
          dataQuality: validationResults?.summary?.dataQuality || 100
        }
      };

      localStorage.setItem(storageKey, JSON.stringify(processedData));

      const indexKey = `data_index_${propertyId}`;
      const existingIndex = JSON.parse(localStorage.getItem(indexKey) || '{}');
      existingIndex[type] = {
        lastUpdated: new Date().toISOString(),
        records: data.length,
        storageKey,
        quality: processedData.summary.dataQuality
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

    return categories.slice(0, 10);
  };

  const downloadTemplate = (type: string) => {
    let headers: string[] = [];
    let sampleData: string[] = [];
    
    const templates: { [key: string]: { headers: string[], sample: string[] } } = {
      'reservas': {
        headers: ['id', 'data_checkin', 'data_checkout', 'valor_total', 'quarto_tipo', 'canal_venda', 'status', 'hospedes', 'hospede_nome', 'hospede_email'],
        sample: ['RSV001', '2024-01-15', '2024-01-17', '850.00', 'Standard', 'Booking.com', 'Confirmada', '2', 'João Silva', 'joao@email.com']
      },
      'custos': {
        headers: ['data', 'categoria', 'valor', 'descricao', 'tipo', 'fornecedor', 'departamento'],
        sample: ['2024-01-01', 'Operacional', '1500.00', 'Limpeza', 'Fixo', 'Empresa Limpeza Ltda', 'Governança']
      },
      'vendas': {
        headers: ['data', 'receita', 'quartos_vendidos', 'canal', 'adr', 'ocupacao', 'revpar'],
        sample: ['2024-01-01', '12500.00', '45', 'Direto', '278.00', '75', '208.50']
      }
    };

    const template = templates[type] || templates['reservas'];
    headers = template.headers;
    sampleData = template.sample;

    const wb = XLSX.utils.book_new();
    const wsData = [headers, sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
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
    XLSX.writeFile(wb, `template_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Template baixado",
      description: `Template para ${dataTypes.find(dt => dt.value === type)?.label} baixado com sucesso.`,
    });
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

  const getDataStatusColor = (status: 'active' | 'outdated' | 'missing') => {
    switch (status) {
      case 'active': return 'border-green-500 bg-green-500/10';
      case 'outdated': return 'border-yellow-500 bg-yellow-500/10';
      case 'missing': return 'border-red-500 bg-red-500/10';
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
            Central de Gestão de Dados - Propriedade: {propertyId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setActiveMode('advanced')}
              variant={activeMode === 'advanced' ? 'default' : 'outline'}
              className={activeMode === 'advanced' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
            >
              <Settings className="w-4 h-4 mr-2" />
              Assistente Avançado
            </Button>
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
            <Button
              onClick={() => setActiveMode('analytics')}
              variant={activeMode === 'analytics' ? 'default' : 'outline'}
              className={activeMode === 'analytics' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics de Dados
            </Button>
          </div>
          
          <div className="text-sm text-slate-400">
            {activeMode === 'advanced' ? (
              <>
                <strong className="text-purple-400">Assistente Avançado:</strong> Sistema completo com preview detalhado, mapeamento dinâmico de campos, transformações, validação customizável, histórico de importações e reversão.
              </>
            ) : activeMode === 'auto' ? (
              <>
                <strong className="text-green-400">Importação Automática:</strong> Validação inteligente com mapeamento flexível de colunas e armazenamento otimizado para arquivos CSV estruturados.
              </>
            ) : activeMode === 'manual' ? (
              <>
                <strong className="text-blue-400">Upload Manual:</strong> Interface clássica com validação básica para diferentes tipos de dados em Excel ou CSV.
              </>
            ) : (
              <>
                <strong className="text-cyan-400">Analytics de Dados:</strong> Análise da qualidade dos dados, métricas de integridade e relatórios de performance de importações.
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Dados Existentes */}
      {activeMode === 'analytics' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dataSummary.map((data) => (
            <Card key={data.type} className={`${getDataStatusColor(data.status)} backdrop-blur-xl border-2`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg">
                    {dataTypes.find(dt => dt.value === data.type)?.icon || '📊'}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    data.status === 'active' ? 'bg-green-600 text-white' :
                    data.status === 'outdated' ? 'bg-yellow-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {data.status === 'active' ? 'Ativo' :
                     data.status === 'outdated' ? 'Desatualizado' : 'Ausente'}
                  </div>
                </div>
                
                <h3 className="text-white font-medium mb-1">{data.label}</h3>
                <div className="text-sm text-slate-300 mb-2">
                  {data.records.toLocaleString()} registros
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Qualidade: {data.quality}%</span>
                  <span>{data.lastUpdated}</span>
                </div>
                
                {data.records > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Qualidade dos Dados</span>
                      <span>{data.quality}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          data.quality >= 95 ? 'bg-green-500' :
                          data.quality >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${data.quality}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Conteúdo baseado no modo selecionado */}
      {activeMode === 'advanced' ? (
        <AdvancedDataImporter propertyId={propertyId} />
      ) : activeMode === 'auto' ? (
        <AutoCSVImporter propertyId={propertyId} />
      ) : activeMode === 'analytics' ? (
        <>
          {/* Analytics detalhado dos dados */}
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Analytics de Qualidade dos Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Métricas Gerais</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total de Registros:</span>
                      <span className="text-white">{dataSummary.reduce((sum, d) => sum + d.records, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Fontes de Dados Ativas:</span>
                      <span className="text-green-400">{dataSummary.filter(d => d.status === 'active').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Qualidade Média:</span>
                      <span className="text-blue-400">
                        {Math.round(dataSummary.reduce((sum, d) => sum + d.quality, 0) / dataSummary.length)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Status por Categoria</h4>
                  <div className="space-y-2">
                    {dataSummary.slice(0, 4).map((data) => (
                      <div key={data.type} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{data.label.split(' ')[0]}:</span>
                        <div className={`px-2 py-1 rounded text-xs ${
                          data.status === 'active' ? 'bg-green-600/20 text-green-400' :
                          data.status === 'outdated' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-red-600/20 text-red-400'
                        }`}>
                          {data.status === 'active' ? 'OK' :
                           data.status === 'outdated' ? 'Antigo' : 'Faltando'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Últimas Atualizações</h4>
                  <div className="space-y-2">
                    {dataSummary
                      .filter(d => d.records > 0)
                      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                      .slice(0, 3)
                      .map((data) => (
                        <div key={data.type} className="text-sm">
                          <div className="text-slate-300">{data.label}</div>
                          <div className="text-slate-500 text-xs">{data.lastUpdated}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Upload Manual - Versão melhorada */}
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
                        {type.icon} {type.label}
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
                    Máximo: 10MB • Suporta: .xlsx, .xls, .csv
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
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Validação e Preview do Arquivo
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-3">
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
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{validationResults.summary?.uniqueRecords || 0}</div>
                      <div className="text-xs text-slate-400">Únicos</div>
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
                      <CheckCircle className="w-4 h-4 mr-2" />
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

      {/* Histórico de Uploads Melhorado */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="w-5 h-5 text-green-400" />
            Histórico Detalhado de Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-4 font-semibold text-white">Arquivo</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Usuário</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Data/Hora</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Registros</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Qualidade</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Tamanho</th>
                  <th className="text-center py-3 px-4 font-semibold text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map((upload) => (
                  <tr key={upload.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{upload.filename}</div>
                      <div className="text-xs text-slate-400">{upload.size}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {dataTypes.find(dt => dt.value === upload.type)?.icon || '📊'}
                        </span>
                        <span className="text-slate-300">{getTypeLabel(upload.type)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{upload.user}</td>
                    <td className="py-3 px-4 text-slate-300">{upload.uploadDate}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white font-medium">{upload.records.toLocaleString()}</div>
                      {upload.errors > 0 && (
                        <div className="text-xs text-red-400">{upload.errors} erros</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className={`text-sm font-medium ${
                          upload.quality >= 95 ? 'text-green-400' :
                          upload.quality >= 85 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {upload.quality}%
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300">{upload.size}</td>
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
              className="bg-blue-600 hover:bg-blue-700 h-12"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            
            <Button
              onClick={() => exportData('pdf')}
              className="bg-red-600 hover:bg-red-700 h-12"
            >
              <Download className="w-4 h-4 mr-2" />
              Relatório PDF
            </Button>
            
            <Button
              onClick={() => exportData('excel')}
              className="bg-green-600 hover:bg-green-700 h-12"
            >
              <Download className="w-4 h-4 mr-2" />
              Planilha Excel
            </Button>
            
            <Button
              onClick={() => exportData('json')}
              className="bg-purple-600 hover:bg-purple-700 h-12"
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
            <CardTitle className="text-white text-sm">Qualidade Média dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {uploadHistory.length > 0 ? 
                Math.round(uploadHistory.reduce((sum, u) => sum + u.quality, 0) / uploadHistory.length) 
                : 0}%
            </div>
            <p className="text-xs text-slate-400">Baseado em todas importações</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataManagement;
