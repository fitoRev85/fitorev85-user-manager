
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

interface DataTransformation {
  type: 'formula' | 'lookup' | 'concatenation' | 'format';
  formula?: string;
  parameters?: Record<string, any>;
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

  // Campos do sistema para mapeamento - expandido para hotéis
  const systemFields = [
    // Informações da Reserva
    { key: 'reservationId', label: 'ID da Reserva', type: 'string', required: true, category: 'Reserva' },
    { key: 'checkInDate', label: 'Data Check-in (D IN)', type: 'date', required: true, category: 'Reserva' },
    { key: 'checkOutDate', label: 'Data Check-out (D OUT)', type: 'date', required: true, category: 'Reserva' },
    { key: 'nights', label: 'Noites', type: 'number', required: false, category: 'Reserva' },
    { key: 'status', label: 'Status da Reserva', type: 'string', required: true, category: 'Reserva' },
    
    // Informações do Quarto
    { key: 'roomType', label: 'Tipo de Quarto', type: 'string', required: false, category: 'Quarto' },
    { key: 'roomNumber', label: 'Número do Quarto', type: 'string', required: false, category: 'Quarto' },
    { key: 'roomCategory', label: 'Categoria do Quarto', type: 'string', required: false, category: 'Quarto' },
    
    // Valores Financeiros
    { key: 'totalValue', label: 'Valor Total', type: 'number', required: true, category: 'Financeiro' },
    { key: 'dailyRate', label: 'Diária Média', type: 'number', required: false, category: 'Financeiro' },
    { key: 'adr', label: 'ADR (Average Daily Rate)', type: 'calculated', required: false, category: 'Financeiro' },
    { key: 'revenue', label: 'Receita', type: 'number', required: false, category: 'Financeiro' },
    { key: 'taxes', label: 'Impostos', type: 'number', required: false, category: 'Financeiro' },
    { key: 'commission', label: 'Comissão', type: 'number', required: false, category: 'Financeiro' },
    
    // Canal de Venda
    { key: 'channel', label: 'Canal/Origem', type: 'string', required: false, category: 'Canal' },
    { key: 'channelType', label: 'Tipo de Canal', type: 'string', required: false, category: 'Canal' },
    { key: 'bookingSource', label: 'Fonte da Reserva', type: 'string', required: false, category: 'Canal' },
    
    // Informações do Hóspede
    { key: 'guestName', label: 'Nome do Hóspede', type: 'string', required: true, category: 'Hóspede' },
    { key: 'guestEmail', label: 'Email do Hóspede', type: 'email', required: false, category: 'Hóspede' },
    { key: 'guestPhone', label: 'Telefone do Hóspede', type: 'string', required: false, category: 'Hóspede' },
    { key: 'guestCount', label: 'Número de Hóspedes', type: 'number', required: false, category: 'Hóspede' },
    { key: 'guestCountry', label: 'País do Hóspede', type: 'string', required: false, category: 'Hóspede' },
    
    // Datas e Controle
    { key: 'bookingDate', label: 'Data da Reserva', type: 'date', required: false, category: 'Controle' },
    { key: 'confirmationDate', label: 'Data de Confirmação', type: 'date', required: false, category: 'Controle' },
    { key: 'cancellationDate', label: 'Data de Cancelamento', type: 'date', required: false, category: 'Controle' },
    
    // Campos Customizados
    { key: 'customField1', label: 'Campo Personalizado 1', type: 'string', required: false, category: 'Personalizado' },
    { key: 'customField2', label: 'Campo Personalizado 2', type: 'string', required: false, category: 'Personalizado' },
    { key: 'customField3', label: 'Campo Personalizado 3', type: 'number', required: false, category: 'Personalizado' }
  ];

  // Transformações predefinidas
  const commonTransformations = [
    { id: 'adr_calculation', label: 'Calcular ADR (Valor Total / Noites)', formula: '=TOTAL_VALUE/NIGHTS' },
    { id: 'revenue_calculation', label: 'Calcular Receita (Valor - Impostos)', formula: '=TOTAL_VALUE-TAXES' },
    { id: 'occupancy_rate', label: 'Taxa de Ocupação', formula: '=ROOMS_OCCUPIED/TOTAL_ROOMS*100' },
    { id: 'date_format', label: 'Formatar Data (DD/MM/AAAA)', formula: 'DATE_FORMAT' },
    { id: 'uppercase', label: 'Converter para Maiúsculo', formula: 'UPPER' },
    { id: 'lowercase', label: 'Converter para Minúsculo', formula: 'LOWER' }
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
      // Filter out empty headers
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
      .filter(h => h && h.trim() !== ''); // Filter out empty headers
    
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

    // Mapeamento inteligente baseado em palavras-chave
    const keywordMappings: Record<string, string[]> = {
      'reservationId': ['id', 'booking', 'reserva', 'reservation'],
      'checkInDate': ['checkin', 'entrada', 'd in', 'data entrada'],
      'checkOutDate': ['checkout', 'saida', 'd out', 'data saida'],
      'totalValue': ['valor', 'total', 'preco', 'price', 'amount'],
      'dailyRate': ['diaria', 'daily', 'rate', 'tarifa'],
      'channel': ['canal', 'channel', 'origem', 'source'],
      'guestName': ['nome', 'name', 'guest', 'hospede'],
      'guestEmail': ['email', 'mail'],
      'roomType': ['quarto', 'room', 'tipo', 'type'],
      'nights': ['noites', 'nights', 'dias', 'days'],
      'status': ['status', 'situacao', 'state']
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

    // Validar dados
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
          case 'email':
            if (value && !/\S+@\S+\.\S+/.test(value)) {
              warnings.push(`Linha ${index + 2}: Email inválido`);
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

      // Transformar dados conforme mapeamento
      const transformedData = sheetData.data.map(row => {
        const transformedRow: any = {
          id: generateUniqueId(),
          propertyId,
          importedAt: new Date().toISOString(),
          fileName,
          sheetName: selectedSheet,
          originalRowIndex: row._rowIndex
        };

        fieldMappings.forEach(mapping => {
          if (mapping.sourceColumn && mapping.targetField) {
            let value = row[mapping.sourceColumn];

            // Aplicar transformações
            if (mapping.transformation) {
              value = applyTransformation(value, mapping.transformation, row);
            }

            // Converter tipos
            value = convertDataType(value, mapping.dataType);
            transformedRow[mapping.targetField] = value;
          }
        });

        return transformedRow;
      });

      // Salvar dados
      const storageKey = `advanced_data_${propertyId}`;
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedData = [...existingData, ...transformedData];
      
      localStorage.setItem(storageKey, JSON.stringify(updatedData));

      // Atualizar índice
      const indexKey = `data_index_${propertyId}`;
      const existingIndex = JSON.parse(localStorage.getItem(indexKey) || '{}');
      existingIndex.advanced_import = {
        lastUpdated: new Date().toISOString(),
        records: updatedData.length,
        lastImport: {
          fileName,
          sheetName: selectedSheet,
          recordsAdded: transformedData.length,
          timestamp: new Date().toISOString()
        }
      };
      localStorage.setItem(indexKey, JSON.stringify(existingIndex));

      toast({
        title: "Importação concluída!",
        description: `${transformedData.length} registros importados com sucesso da aba "${selectedSheet}".`,
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

  const applyTransformation = (value: any, transformation: string, row: any): any => {
    // Aplicar transformações básicas
    switch (transformation) {
      case 'adr_calculation':
        const totalValue = parseFloat(row.totalValue || '0');
        const nights = parseFloat(row.nights || '1');
        return nights > 0 ? totalValue / nights : 0;
      case 'uppercase':
        return value ? value.toString().toUpperCase() : '';
      case 'lowercase':
        return value ? value.toString().toLowerCase() : '';
      default:
        return value;
    }
  };

  const convertDataType = (value: any, type: string): any => {
    if (!value || value === '') return null;

    switch (type) {
      case 'number':
        const numValue = parseFloat(value.toString().replace(',', '.'));
        return isNaN(numValue) ? null : numValue;
      case 'date':
        const dateValue = new Date(value);
        return isNaN(dateValue.getTime()) ? null : dateValue.toISOString();
      case 'email':
        return value.toString().toLowerCase();
      default:
        return value.toString();
    }
  };

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
                        {commonTransformations.map(transform => (
                          <SelectItem key={transform.id} value={transform.id}>
                            {transform.label}
                          </SelectItem>
                        ))}
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
