
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Settings, Zap, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface AdvancedDataImporterProps {
  propertyId: string;
}

interface SheetData {
  name: string;
  headers: string[];
  data: any[];
  preview: any[];
}

interface FieldMapping {
  sourceColumn: string;
  targetField: string;
  transformation?: string;
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'email' | 'calculated';
}

const AdvancedDataImporter = ({ propertyId }: AdvancedDataImporterProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<'upload' | 'sheet-select' | 'mapping' | 'validation' | 'import'>('upload');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  // Campos do sistema simplificados para compatibilidade com ForecastDashboard
  const systemFields = [
    // Campos principais para dashboard
    { key: 'id', label: 'ID da Reserva', type: 'string', required: true, category: 'Reserva' },
    { key: 'data_checkin', label: 'Data Check-in', type: 'date', required: true, category: 'Reserva' },
    { key: 'data_checkout', label: 'Data Check-out', type: 'date', required: true, category: 'Reserva' },
    { key: 'valor_total', label: 'Valor Total', type: 'number', required: true, category: 'Financeiro' },
    { key: 'situacao', label: 'Situação', type: 'string', required: true, category: 'Status' },
    { key: 'canal', label: 'Canal/Origem', type: 'string', required: false, category: 'Canal' },
    { key: 'hospede_nome', label: 'Nome do Hóspede', type: 'string', required: false, category: 'Hóspede' },
    { key: 'tipo_quarto', label: 'Tipo de Quarto', type: 'string', required: false, category: 'Quarto' },
    { key: 'noites', label: 'Número de Noites', type: 'number', required: false, category: 'Reserva' },
    { key: 'diaria_media', label: 'Diária Média', type: 'number', required: false, category: 'Financeiro' }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.toLowerCase().match(/\.(xlsx|xls)$/);
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    if (!isExcel && !isCsv) {
      toast({
        title: "Formato não suportado",
        description: "Por favor, selecione um arquivo Excel (.xlsx/.xls) ou CSV.",
        variant: "destructive"
      });
      return;
    }

    try {
      setFileName(file.name);
      
      if (isExcel) {
        await processExcelFile(file);
      } else {
        await processCSVFile(file);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: "Erro ao processar arquivo",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
  };

  const processExcelFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    setWorkbook(wb);

    const sheetData: SheetData[] = wb.SheetNames.map(sheetName => {
      const ws = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (jsonData.length === 0) {
        return { name: sheetName, headers: [], data: [], preview: [] };
      }

      const headers = (jsonData[0] as string[]) || [];
      const validHeaders = headers.filter(header => header && header.toString().trim() !== '');
      const rows = jsonData.slice(1) as any[][];
      
      const formattedData = rows
        .filter(row => row.some(cell => cell !== undefined && cell !== ''))
        .map((row, index) => {
          const rowData: any = { _rowIndex: index + 2 };
          validHeaders.forEach((header, i) => {
            rowData[header] = row[i] || '';
          });
          return rowData;
        });

      return {
        name: sheetName,
        headers: validHeaders,
        data: formattedData,
        preview: formattedData.slice(0, 5)
      };
    });

    setSheets(sheetData);
    
    if (sheetData.length === 1) {
      setSelectedSheet(sheetData[0].name);
      generateSuggestedMappings(sheetData[0].headers);
      setCurrentStep('mapping');
    } else {
      setCurrentStep('sheet-select');
    }
  };

  const processCSVFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      throw new Error('Arquivo CSV vazio');
    }

    const headers = lines[0].split(',')
      .map(h => h.trim().replace(/"/g, ''))
      .filter(h => h && h.trim() !== '');
    
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    const sheetData: SheetData = {
      name: 'CSV Data',
      headers,
      data: rows,
      preview: rows.slice(0, 5)
    };

    setSheets([sheetData]);
    setSelectedSheet('CSV Data');
    generateSuggestedMappings(headers);
    setCurrentStep('mapping');
  };

  const generateSuggestedMappings = (headers: string[]) => {
    const mappings: FieldMapping[] = [];

    // Mapeamento inteligente
    const keywordMappings: Record<string, string[]> = {
      'id': ['id', 'booking', 'reserva', 'reservation'],
      'data_checkin': ['checkin', 'entrada', 'check in', 'data entrada', 'd in'],
      'data_checkout': ['checkout', 'saida', 'check out', 'data saida', 'd out'],
      'valor_total': ['valor', 'total', 'preco', 'price', 'amount'],
      'situacao': ['situacao', 'status', 'state', 'situação'],
      'canal': ['canal', 'channel', 'origem', 'source'],
      'hospede_nome': ['nome', 'name', 'guest', 'hospede', 'hóspede'],
      'tipo_quarto': ['quarto', 'room', 'tipo', 'type'],
      'noites': ['noites', 'nights', 'dias', 'days'],
      'diaria_media': ['diaria', 'daily', 'rate', 'tarifa', 'média']
    };

    systemFields.forEach(field => {
      const keywords = keywordMappings[field.key] || [field.key.toLowerCase()];
      
      const matchedHeader = headers.find(header =>
        keywords.some(keyword =>
          header.toLowerCase().includes(keyword) ||
          keyword.includes(header.toLowerCase())
        )
      );

      if (matchedHeader) {
        mappings.push({
          sourceColumn: matchedHeader,
          targetField: field.key,
          required: field.required,
          dataType: field.type as any
        });
      }
    });

    setFieldMappings(mappings);
  };

  const getSelectedSheetData = () => {
    return sheets.find(sheet => sheet.name === selectedSheet);
  };

  const addFieldMapping = () => {
    setFieldMappings([...fieldMappings, {
      sourceColumn: '',
      targetField: '',
      required: false,
      dataType: 'string'
    }]);
  };

  const updateFieldMapping = (index: number, field: keyof FieldMapping, value: any) => {
    const updatedMappings = [...fieldMappings];
    updatedMappings[index] = { ...updatedMappings[index], [field]: value };
    setFieldMappings(updatedMappings);
  };

  const removeFieldMapping = (index: number) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));
  };

  const validateMappings = () => {
    const sheetData = getSelectedSheetData();
    if (!sheetData) return;

    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Verificar campos obrigatórios
    const requiredFields = systemFields.filter(f => f.required);
    const mappedRequiredFields = fieldMappings.filter(m => 
      requiredFields.some(rf => rf.key === m.targetField && m.sourceColumn)
    );

    if (mappedRequiredFields.length < requiredFields.length) {
      const missingFields = requiredFields.filter(rf => 
        !mappedRequiredFields.some(mrf => mrf.targetField === rf.key)
      );
      errors.push(`Campos obrigatórios não mapeados: ${missingFields.map(f => f.label).join(', ')}`);
    }

    let validRecords = 0;
    let invalidDates = 0;
    let invalidNumbers = 0;

    sheetData.data.forEach((row, index) => {
      let rowValid = true;

      fieldMappings.forEach(mapping => {
        if (!mapping.sourceColumn || !mapping.targetField) return;

        const value = row[mapping.sourceColumn];
        
        switch (mapping.dataType) {
          case 'date':
            if (value && isNaN(Date.parse(value))) {
              invalidDates++;
              rowValid = false;
            }
            break;
          case 'number':
            if (value && isNaN(parseFloat(value.toString().replace(',', '.')))) {
              invalidNumbers++;
              rowValid = false;
            }
            break;
        }
      });

      if (rowValid) validRecords++;
    });

    if (invalidDates > 0) {
      warnings.push(`${invalidDates} datas em formato inválido encontradas`);
    }

    if (invalidNumbers > 0) {
      warnings.push(`${invalidNumbers} valores numéricos inválidos encontrados`);
    }

    const results = {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalRecords: sheetData.data.length,
      validRecords,
      dataQuality: Math.round((validRecords / sheetData.data.length) * 100)
    };

    setValidationResults(results);
    setCurrentStep('validation');
  };

  const executeImport = async () => {
    setImporting(true);

    try {
      const sheetData = getSelectedSheetData();
      if (!sheetData) throw new Error('Dados da planilha não encontrados');

      console.log('Iniciando importação...', {
        propertyId,
        sheetName: selectedSheet,
        totalRecords: sheetData.data.length,
        mappings: fieldMappings
      });

      // Transformar dados para formato simples e compatível
      const transformedData = sheetData.data.map((row, index) => {
        const transformedRow: any = {
          id: `${propertyId}_${Date.now()}_${index}`,
          propertyId
        };

        fieldMappings.forEach(mapping => {
          if (mapping.sourceColumn && mapping.targetField) {
            let value = row[mapping.sourceColumn];

            // Converter tipos
            switch (mapping.dataType) {
              case 'number':
                if (value !== null && value !== undefined && value !== '') {
                  const numValue = parseFloat(value.toString().replace(',', '.'));
                  value = isNaN(numValue) ? 0 : numValue;
                } else {
                  value = 0;
                }
                break;
              case 'date':
                if (value) {
                  const date = new Date(value);
                  value = isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
                } else {
                  value = null;
                }
                break;
              default:
                value = value ? value.toString() : '';
            }

            transformedRow[mapping.targetField] = value;
          }
        });

        return transformedRow;
      });

      console.log('Dados transformados (primeiros 3):', transformedData.slice(0, 3));

      // Salvar em chunks para evitar quota excedida
      const chunkSize = 100; // Reduzir tamanho dos chunks
      const chunks = [];
      
      for (let i = 0; i < transformedData.length; i += chunkSize) {
        chunks.push(transformedData.slice(i, i + chunkSize));
      }

      // Limpar dados antigos para liberar espaço
      const oldStorageKey = `reservas_${propertyId}`;
      const newStorageKey = `forecast_data_${propertyId}`;
      
      // Remover dados antigos
      localStorage.removeItem(oldStorageKey);
      
      // Salvar em chunks
      let totalSaved = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunkKey = `${newStorageKey}_chunk_${i}`;
        try {
          localStorage.setItem(chunkKey, JSON.stringify(chunks[i]));
          totalSaved += chunks[i].length;
          console.log(`Chunk ${i + 1}/${chunks.length} salvo com ${chunks[i].length} registros`);
        } catch (error) {
          console.error(`Erro ao salvar chunk ${i}:`, error);
          throw new Error(`Erro ao salvar dados - chunk ${i + 1}`);
        }
      }

      // Salvar índice dos chunks
      const indexData = {
        totalChunks: chunks.length,
        totalRecords: totalSaved,
        lastUpdated: new Date().toISOString(),
        fileName,
        sheetName: selectedSheet,
        storagePrefix: newStorageKey
      };

      localStorage.setItem(`${newStorageKey}_index`, JSON.stringify(indexData));
      console.log('Índice salvo:', indexData);

      toast({
        title: "Importação concluída!",
        description: `${totalSaved} registros importados com sucesso da aba "${selectedSheet}".`,
      });

      resetImporter();
      
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
    
    setImporting(false);
  };

  const resetImporter = () => {
    setCurrentStep('upload');
    setWorkbook(null);
    setSheets([]);
    setSelectedSheet('');
    setFieldMappings([]);
    setFileName('');
    setValidationResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const groupedSystemFields = systemFields.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, typeof systemFields>);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-400" />
          Assistente Avançado de Importação - Propriedade: {propertyId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div className="text-center space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8">
              <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Selecione seu arquivo</h3>
              <p className="text-slate-400 text-sm mb-4">
                Suporta Excel (.xlsx/.xls) com múltiplas abas e CSV
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Seleção de Aba (Excel) */}
        {currentStep === 'sheet-select' && (
          <div className="space-y-4">
            <h3 className="text-white font-medium">Selecione a aba para importar:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sheets.map(sheet => (
                <Card key={sheet.name} 
                      className={`cursor-pointer transition-colors ${
                        selectedSheet === sheet.name 
                          ? 'bg-blue-600/20 border-blue-500' 
                          : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                      }`}
                      onClick={() => setSelectedSheet(sheet.name)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{sheet.name}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {sheet.data.length} registros • {sheet.headers.length} colunas
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Colunas: {sheet.headers.slice(0, 3).join(', ')}
                      {sheet.headers.length > 3 && '...'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button
              onClick={() => {
                if (selectedSheet) {
                  const sheet = sheets.find(s => s.name === selectedSheet);
                  if (sheet) {
                    generateSuggestedMappings(sheet.headers);
                    setCurrentStep('mapping');
                  }
                }
              }}
              disabled={!selectedSheet}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continuar com "{selectedSheet}"
            </Button>
          </div>
        )}

        {/* Step 3: Mapeamento de Campos */}
        {currentStep === 'mapping' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Mapeamento de Campos</h3>
              <Button
                onClick={addFieldMapping}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Adicionar Campo
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {fieldMappings.map((mapping, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Coluna do Arquivo</label>
                    <Select value={mapping.sourceColumn} onValueChange={(value) => updateFieldMapping(index, 'sourceColumn', value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {getSelectedSheetData()?.headers.filter(header => header && header.trim() !== '').map(header => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Campo do Sistema</label>
                    <Select value={mapping.targetField} onValueChange={(value) => updateFieldMapping(index, 'targetField', value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {Object.entries(groupedSystemFields).map(([category, fields]) => (
                          <div key={category}>
                            <div className="px-2 py-1 text-xs font-medium text-slate-400 bg-slate-800">
                              {category}
                            </div>
                            {fields.map(field => (
                              <SelectItem key={field.key} value={field.key}>
                                {field.label} {field.required && '*'}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tipo de Dados</label>
                    <Select value={mapping.dataType} onValueChange={(value) => updateFieldMapping(index, 'dataType', value as any)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Data</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="calculated">Calculado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Transformação</label>
                    <Select value={mapping.transformation || 'none'} onValueChange={(value) => updateFieldMapping(index, 'transformation', value === 'none' ? undefined : value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Nenhuma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        <SelectItem value="uppercase">Maiúsculo</SelectItem>
                        <SelectItem value="lowercase">Minúsculo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() => removeFieldMapping(index)}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-900/20 w-full"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentStep('upload')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Voltar
              </Button>
              
              <Button
                onClick={validateMappings}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Validar Mapeamentos
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Validação */}
        {currentStep === 'validation' && validationResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {validationResults.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <h3 className="text-white font-medium">Resultados da Validação</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-400">{validationResults.totalRecords}</div>
                <div className="text-xs text-slate-400">Total de Registros</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-green-400">{validationResults.validRecords}</div>
                <div className="text-xs text-slate-400">Registros Válidos</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-red-400">{validationResults.errors.length}</div>
                <div className="text-xs text-slate-400">Erros</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-cyan-400">{validationResults.dataQuality}%</div>
                <div className="text-xs text-slate-400">Qualidade</div>
              </div>
            </div>

            {validationResults.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-600/30 p-4 rounded-lg">
                <h4 className="text-red-400 font-medium mb-2">Erros encontrados:</h4>
                {validationResults.errors.map((error: string, index: number) => (
                  <div key={index} className="text-red-300 text-sm">• {error}</div>
                ))}
              </div>
            )}

            {validationResults.warnings.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
                <h4 className="text-yellow-400 font-medium mb-2">Avisos:</h4>
                {validationResults.warnings.map((warning: string, index: number) => (
                  <div key={index} className="text-yellow-300 text-sm">• {warning}</div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentStep('mapping')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Voltar ao Mapeamento
              </Button>
              
              <Button
                onClick={executeImport}
                disabled={!validationResults.isValid || importing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                {importing ? 'Importando...' : 'Confirmar Importação'}
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default AdvancedDataImporter;
