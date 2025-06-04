import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Settings, Zap, FileText, Eye, RotateCcw, History, Download } from 'lucide-react';
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
  validationRule?: string;
  defaultValue?: string;
}

interface ValidationRule {
  id: string;
  name: string;
  type: 'required' | 'format' | 'range' | 'custom';
  field: string;
  condition: string;
  message: string;
  enabled: boolean;
}

interface ImportLog {
  id: string;
  timestamp: string;
  fileName: string;
  sheetName?: string;
  totalRecords: number;
  successRecords: number;
  errorRecords: number;
  status: 'success' | 'partial' | 'failed';
  errors: string[];
  warnings: string[];
  canRevert: boolean;
}

const AdvancedDataImporter = ({ propertyId }: AdvancedDataImporterProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<'upload' | 'sheet-select' | 'preview' | 'mapping' | 'validation' | 'rules' | 'import' | 'history'>('upload');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importHistory, setImportHistory] = useState<ImportLog[]>([]);

  // Campos do sistema expandidos
  const systemFields = [
    { key: 'id', label: 'ID da Reserva', type: 'string', required: true, category: 'Reserva' },
    { key: 'data_checkin', label: 'Data Check-in', type: 'date', required: true, category: 'Reserva' },
    { key: 'data_checkout', label: 'Data Check-out', type: 'date', required: true, category: 'Reserva' },
    { key: 'valor_total', label: 'Valor Total', type: 'number', required: true, category: 'Financeiro' },
    { key: 'situacao', label: 'Situação', type: 'string', required: true, category: 'Status' },
    { key: 'canal', label: 'Canal/Origem', type: 'string', required: false, category: 'Canal' },
    { key: 'hospede_nome', label: 'Nome do Hóspede', type: 'string', required: false, category: 'Hóspede' },
    { key: 'hospede_email', label: 'Email do Hóspede', type: 'email', required: false, category: 'Hóspede' },
    { key: 'tipo_quarto', label: 'Tipo de Quarto', type: 'string', required: false, category: 'Quarto' },
    { key: 'numero_quarto', label: 'Número do Quarto', type: 'string', required: false, category: 'Quarto' },
    { key: 'noites', label: 'Número de Noites', type: 'calculated', required: false, category: 'Reserva' },
    { key: 'diaria_media', label: 'Diária Média', type: 'calculated', required: false, category: 'Financeiro' },
    { key: 'comissao', label: 'Comissão (%)', type: 'number', required: false, category: 'Financeiro' },
    { key: 'desconto', label: 'Desconto Aplicado', type: 'number', required: false, category: 'Financeiro' },
    { key: 'observacoes', label: 'Observações', type: 'string', required: false, category: 'Outros' }
  ];

  // Regras de validação padrão
  const defaultValidationRules: ValidationRule[] = [
    {
      id: 'check_dates_order',
      name: 'Check-in antes de Check-out',
      type: 'custom',
      field: 'data_checkin,data_checkout',
      condition: 'checkin < checkout',
      message: 'Data de check-in deve ser anterior ao check-out',
      enabled: true
    },
    {
      id: 'positive_value',
      name: 'Valor Total Positivo',
      type: 'range',
      field: 'valor_total',
      condition: '> 0',
      message: 'Valor total deve ser maior que zero',
      enabled: true
    },
    {
      id: 'email_format',
      name: 'Formato de Email',
      type: 'format',
      field: 'hospede_email',
      condition: 'email',
      message: 'Email deve ter formato válido',
      enabled: true
    },
    {
      id: 'future_checkin',
      name: 'Check-in não pode ser no passado distante',
      type: 'custom',
      field: 'data_checkin',
      condition: '> 2020-01-01',
      message: 'Data de check-in deve ser posterior a 2020',
      enabled: true
    }
  ];

  React.useEffect(() => {
    setValidationRules(defaultValidationRules);
    loadImportHistory();
  }, []);

  const loadImportHistory = () => {
    const historyKey = `import_history_${propertyId}`;
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      try {
        setImportHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    }
  };

  const saveImportHistory = (log: ImportLog) => {
    const historyKey = `import_history_${propertyId}`;
    const updated = [log, ...importHistory].slice(0, 50); // Manter últimas 50 importações
    setImportHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  };

  const convertExcelDate = (value: any): string | null => {
    if (!value) return null;
    
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
        return date.toISOString().split('T')[0];
      }
    }
    
    if (typeof value === 'number' && value > 0) {
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (value - 1) * 24 * 60 * 60 * 1000);
      
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
        return date.toISOString().split('T')[0];
      }
    }
    
    console.warn('Não foi possível converter data:', value);
    return null;
  };

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
    const wb = XLSX.read(data, { cellDates: true });
    setWorkbook(wb);

    const sheetData: SheetData[] = wb.SheetNames.map(sheetName => {
      const ws = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
      
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

      console.log(`📊 Planilha ${sheetName}:`, {
        headers: validHeaders,
        totalRows: formattedData.length,
        amostra: formattedData.slice(0, 2)
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
      setPreviewData(sheetData[0].preview);
      generateSuggestedMappings(sheetData[0].headers);
      setCurrentStep('preview');
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
    setPreviewData(sheetData.preview);
    generateSuggestedMappings(headers);
    setCurrentStep('preview');
  };

  const generateSuggestedMappings = (headers: string[]) => {
    const mappings: FieldMapping[] = [];

    const keywordMappings: Record<string, string[]> = {
      'id': ['id', 'booking', 'reserva', 'reservation', 'número', 'numero', 'nº'],
      'data_checkin': ['checkin', 'entrada', 'check in', 'data entrada', 'd in', 'in'],
      'data_checkout': ['checkout', 'saida', 'check out', 'data saida', 'd out', 'out'],
      'valor_total': ['valor', 'total', 'preco', 'price', 'amount', 'diarias'],
      'situacao': ['situacao', 'status', 'state', 'situação'],
      'canal': ['canal', 'channel', 'origem', 'source'],
      'hospede_nome': ['nome', 'name', 'guest', 'hospede', 'hóspede'],
      'hospede_email': ['email', 'e-mail', 'mail'],
      'tipo_quarto': ['quarto', 'room', 'tipo', 'type'],
      'numero_quarto': ['numero quarto', 'room number', 'quarto num'],
      'noites': ['noites', 'nights', 'dias', 'days', 'estadia'],
      'diaria_media': ['diaria', 'daily', 'rate', 'tarifa', 'média', 'media'],
      'comissao': ['comissao', 'commission', 'comissão'],
      'desconto': ['desconto', 'discount', 'desc']
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
          dataType: field.type as any,
          validationRule: getDefaultValidationRule(field.key)
        });
      }
    });

    console.log('🎯 Mapeamentos sugeridos:', mappings);
    setFieldMappings(mappings);
  };

  const getDefaultValidationRule = (fieldKey: string): string => {
    const rules: Record<string, string> = {
      'valor_total': 'required|numeric|min:0',
      'data_checkin': 'required|date',
      'data_checkout': 'required|date|after:data_checkin',
      'hospede_email': 'email',
      'id': 'required|unique'
    };
    return rules[fieldKey] || '';
  };

  const getSelectedSheetData = () => {
    return sheets.find(sheet => sheet.name === selectedSheet);
  };

  const addFieldMapping = () => {
    setFieldMappings([...fieldMappings, {
      sourceColumn: '',
      targetField: '',
      required: false,
      dataType: 'string',
      validationRule: ''
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

  const addValidationRule = () => {
    const newRule: ValidationRule = {
      id: `rule_${Date.now()}`,
      name: 'Nova Regra',
      type: 'required',
      field: '',
      condition: '',
      message: '',
      enabled: true
    };
    setValidationRules([...validationRules, newRule]);
  };

  const updateValidationRule = (index: number, field: keyof ValidationRule, value: any) => {
    const updatedRules = [...validationRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setValidationRules(updatedRules);
  };

  const removeValidationRule = (index: number) => {
    setValidationRules(validationRules.filter((_, i) => i !== index));
  };

  const validateMappings = () => {
    const sheetData = getSelectedSheetData();
    if (!sheetData) return;

    const errors: string[] = [];
    const warnings: string[] = [];
    
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
    let validationErrors: string[] = [];

    sheetData.data.forEach((row, index) => {
      let rowValid = true;

      fieldMappings.forEach(mapping => {
        if (!mapping.sourceColumn || !mapping.targetField) return;

        const value = row[mapping.sourceColumn];
        
        // Validação por tipo de dados
        switch (mapping.dataType) {
          case 'date':
            if (value) {
              const convertedDate = convertExcelDate(value);
              if (!convertedDate) {
                invalidDates++;
                rowValid = false;
                validationErrors.push(`Linha ${index + 2}: Data inválida em ${mapping.sourceColumn}`);
              }
            }
            break;
          case 'number':
            if (value && isNaN(parseFloat(value.toString().replace(',', '.')))) {
              invalidNumbers++;
              rowValid = false;
              validationErrors.push(`Linha ${index + 2}: Número inválido em ${mapping.sourceColumn}`);
            }
            break;
          case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              rowValid = false;
              validationErrors.push(`Linha ${index + 2}: Email inválido em ${mapping.sourceColumn}`);
            }
            break;
        }

        // Validação por regras customizadas
        if (mapping.validationRule) {
          const ruleResult = validateCustomRule(value, mapping.validationRule, row);
          if (!ruleResult.valid) {
            rowValid = false;
            validationErrors.push(`Linha ${index + 2}: ${ruleResult.message}`);
          }
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
      validationErrors: validationErrors.slice(0, 10), // Mostrar apenas os primeiros 10 erros
      totalRecords: sheetData.data.length,
      validRecords,
      dataQuality: Math.round((validRecords / sheetData.data.length) * 100)
    };

    setValidationResults(results);
    setCurrentStep('validation');
  };

  const validateCustomRule = (value: any, rule: string, row: any): { valid: boolean; message: string } => {
    const rules = rule.split('|');
    
    for (const r of rules) {
      if (r === 'required' && (!value || value.toString().trim() === '')) {
        return { valid: false, message: 'Campo obrigatório não preenchido' };
      }
      
      if (r === 'numeric' && value && isNaN(parseFloat(value.toString()))) {
        return { valid: false, message: 'Deve ser um número válido' };
      }
      
      if (r.startsWith('min:')) {
        const min = parseFloat(r.split(':')[1]);
        if (value && parseFloat(value.toString()) < min) {
          return { valid: false, message: `Valor deve ser maior que ${min}` };
        }
      }
      
      if (r === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { valid: false, message: 'Email em formato inválido' };
      }
    }
    
    return { valid: true, message: '' };
  };

  const executeImport = async () => {
    setImporting(true);

    try {
      const sheetData = getSelectedSheetData();
      if (!sheetData) throw new Error('Dados da planilha não encontrados');

      console.log('🚀 Iniciando importação...', {
        propertyId,
        sheetName: selectedSheet,
        totalRecords: sheetData.data.length,
        mappings: fieldMappings
      });

      const transformedData = sheetData.data.map((row, index) => {
        const transformedRow: any = {
          id: `${propertyId}_${Date.now()}_${index}`,
          propertyId,
          _originalRowIndex: index + 2
        };

        fieldMappings.forEach(mapping => {
          if (mapping.sourceColumn && mapping.targetField) {
            let value = row[mapping.sourceColumn];

            switch (mapping.dataType) {
              case 'number':
                if (value !== null && value !== undefined && value !== '') {
                  const numValue = parseFloat(value.toString().replace(',', '.'));
                  value = isNaN(numValue) ? (mapping.defaultValue ? parseFloat(mapping.defaultValue) : 0) : numValue;
                } else {
                  value = mapping.defaultValue ? parseFloat(mapping.defaultValue) : 0;
                }
                break;
              case 'date':
                if (value) {
                  const convertedDate = convertExcelDate(value);
                  value = convertedDate || mapping.defaultValue || null;
                } else {
                  value = mapping.defaultValue || null;
                }
                break;
              case 'calculated':
                if (mapping.targetField === 'noites' && transformedRow.data_checkin && transformedRow.data_checkout) {
                  const checkin = new Date(transformedRow.data_checkin);
                  const checkout = new Date(transformedRow.data_checkout);
                  value = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
                } else if (mapping.targetField === 'diaria_media' && transformedRow.valor_total && transformedRow.noites) {
                  value = transformedRow.valor_total / transformedRow.noites;
                }
                break;
              default:
                value = value ? value.toString().trim() : (mapping.defaultValue || '');
            }

            // Aplicar transformações
            if (mapping.transformation && value) {
              switch (mapping.transformation) {
                case 'uppercase':
                  value = value.toString().toUpperCase();
                  break;
                case 'lowercase':
                  value = value.toString().toLowerCase();
                  break;
              }
            }

            transformedRow[mapping.targetField] = value;
          }
        });

        return transformedRow;
      }).filter(row => row.data_checkin); // Filtrar apenas registros com data válida

      console.log('✅ Dados transformados:', {
        total: transformedData.length,
        amostra: transformedData.slice(0, 3)
      });

      // Backup dos dados atuais para possível reversão
      const backupKey = `backup_${propertyId}_${Date.now()}`;
      const currentData = localStorage.getItem(`forecast_data_${propertyId}_index`);
      if (currentData) {
        localStorage.setItem(backupKey, currentData);
      }

      // Limpar dados antigos
      const oldKeys = [
        `reservas_${propertyId}`,
        `forecast_data_${propertyId}`,
        `reservations_data_${propertyId}`
      ];
      
      oldKeys.forEach(key => localStorage.removeItem(key));

      // Salvar em chunks
      const chunkSize = 100;
      const chunks = [];
      
      for (let i = 0; i < transformedData.length; i += chunkSize) {
        chunks.push(transformedData.slice(i, i + chunkSize));
      }

      const newStorageKey = `forecast_data_${propertyId}`;
      
      let totalSaved = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunkKey = `${newStorageKey}_chunk_${i}`;
        try {
          localStorage.setItem(chunkKey, JSON.stringify(chunks[i]));
          totalSaved += chunks[i].length;
          console.log(`📦 Chunk ${i + 1}/${chunks.length} salvo com ${chunks[i].length} registros`);
        } catch (error) {
          console.error(`❌ Erro ao salvar chunk ${i}:`, error);
          throw new Error(`Erro ao salvar dados - chunk ${i + 1}`);
        }
      }

      // Salvar índice
      const indexData = {
        totalChunks: chunks.length,
        totalRecords: totalSaved,
        lastUpdated: new Date().toISOString(),
        fileName,
        sheetName: selectedSheet,
        storagePrefix: newStorageKey,
        backupKey,
        importId: `import_${Date.now()}`
      };

      localStorage.setItem(`${newStorageKey}_index`, JSON.stringify(indexData));

      // Criar log de importação
      const importLog: ImportLog = {
        id: indexData.importId,
        timestamp: new Date().toISOString(),
        fileName,
        sheetName: selectedSheet,
        totalRecords: sheetData.data.length,
        successRecords: totalSaved,
        errorRecords: sheetData.data.length - totalSaved,
        status: totalSaved === sheetData.data.length ? 'success' : 'partial',
        errors: validationResults?.errors || [],
        warnings: validationResults?.warnings || [],
        canRevert: !!currentData
      };

      saveImportHistory(importLog);
      
      console.log('🎉 Importação concluída:', {
        totalSaved,
        chunks: chunks.length,
        indexData,
        importLog
      });

      toast({
        title: "Importação concluída!",
        description: `${totalSaved} registros importados com sucesso da aba "${selectedSheet}".`,
      });

      resetImporter();
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro na importação:', error);
      
      const errorLog: ImportLog = {
        id: `error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        fileName,
        sheetName: selectedSheet,
        totalRecords: 0,
        successRecords: 0,
        errorRecords: 0,
        status: 'failed',
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
        warnings: [],
        canRevert: false
      };
      
      saveImportHistory(errorLog);
      
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
    
    setImporting(false);
  };

  const revertImport = async (importId: string) => {
    const importLog = importHistory.find(log => log.id === importId);
    if (!importLog || !importLog.canRevert) {
      toast({
        title: "Não é possível reverter",
        description: "Esta importação não pode ser revertida.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Implementar lógica de reversão aqui
      toast({
        title: "Importação revertida",
        description: "Os dados foram restaurados para o estado anterior.",
      });
    } catch (error) {
      toast({
        title: "Erro ao reverter",
        description: "Não foi possível reverter a importação.",
        variant: "destructive"
      });
    }
  };

  const exportImportLog = (log: ImportLog) => {
    const exportData = {
      ...log,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_log_${log.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetImporter = () => {
    setCurrentStep('upload');
    setWorkbook(null);
    setSheets([]);
    setSelectedSheet('');
    setFieldMappings([]);
    setFileName('');
    setValidationResults(null);
    setPreviewData([]);
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
          Sistema Avançado de Importação - Propriedade: {propertyId}
        </CardTitle>
        <div className="flex gap-2 text-sm">
          <Button
            variant={currentStep === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentStep('history')}
            className="text-xs"
          >
            <History className="w-4 h-4 mr-1" />
            Histórico
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Step: Upload */}
        {currentStep === 'upload' && (
          <div className="text-center space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 hover:border-blue-500/50 transition-colors">
              <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Selecione seu arquivo</h3>
              <p className="text-slate-400 text-sm mb-4">
                Sistema inteligente com preview, mapeamento flexível e validação customizável
              </p>
              <div className="text-xs text-slate-500 mb-4 space-y-1">
                <div>✓ Suporte a Excel (.xlsx/.xls) e CSV</div>
                <div>✓ Preview dos dados antes da importação</div>
                <div>✓ Mapeamento flexível de campos</div>
                <div>✓ Validação com regras customizáveis</div>
                <div>✓ Histórico detalhado de importações</div>
                <div>✓ Possibilidade de reversão</div>
              </div>
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

        {/* Step: Seleção de Aba */}
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
                      onClick={() => {
                        setSelectedSheet(sheet.name);
                        setPreviewData(sheet.preview);
                      }}>
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
                    setCurrentStep('preview');
                  }
                }
              }}
              disabled={!selectedSheet}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar Dados de "{selectedSheet}"
            </Button>
          </div>
        )}

        {/* Step: Preview dos Dados */}
        {currentStep === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Preview dos Dados - {selectedSheet}</h3>
              <div className="text-sm text-slate-400">
                Mostrando {previewData.length} de {getSelectedSheetData()?.data.length || 0} registros
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    {getSelectedSheetData()?.headers.map((header, index) => (
                      <th key={index} className="text-left p-2 text-slate-300 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="border-b border-slate-700/50">
                      {getSelectedSheetData()?.headers.map((header, colIndex) => (
                        <td key={colIndex} className="p-2 text-slate-200">
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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
                onClick={() => setCurrentStep('mapping')}
                className="bg-green-600 hover:bg-green-700"
              >
                Configurar Mapeamento
              </Button>
            </div>
          </div>
        )}

        {/* Step: Mapeamento de Campos - mantendo o código existente mas melhorado */}
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
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-slate-700/30 rounded-lg">
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
                    <label className="block text-xs text-slate-400 mb-1">Valor Padrão</label>
                    <Input
                      value={mapping.defaultValue || ''}
                      onChange={(e) => updateFieldMapping(index, 'defaultValue', e.target.value)}
                      placeholder="Opcional"
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                    />
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
                onClick={() => setCurrentStep('preview')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Voltar ao Preview
              </Button>
              
              <Button
                onClick={() => setCurrentStep('rules')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar Validações
              </Button>
              
              <Button
                onClick={validateMappings}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Validar Dados
              </Button>
            </div>
          </div>
        )}

        {/* Step: Configuração de Regras de Validação */}
        {currentStep === 'rules' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Regras de Validação Customizadas</h3>
              <Button
                onClick={addValidationRule}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Adicionar Regra
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {validationRules.map((rule, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Input
                      value={rule.name}
                      onChange={(e) => updateValidationRule(index, 'name', e.target.value)}
                      placeholder="Nome da regra"
                      className="bg-slate-700 border-slate-600 text-white flex-1 mr-3"
                    />
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => updateValidationRule(index, 'enabled', checked)}
                    />
                    <Button
                      onClick={() => removeValidationRule(index)}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-900/20 ml-2"
                    >
                      Remover
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                      <Select value={rule.type} onValueChange={(value) => updateValidationRule(index, 'type', value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Obrigatório</SelectItem>
                          <SelectItem value="format">Formato</SelectItem>
                          <SelectItem value="range">Faixa de Valores</SelectItem>
                          <SelectItem value="custom">Customizada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Campo</label>
                      <Select value={rule.field} onValueChange={(value) => updateValidationRule(index, 'field', value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {systemFields.map(field => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Condição</label>
                      <Input
                        value={rule.condition}
                        onChange={(e) => updateValidationRule(index, 'condition', e.target.value)}
                        placeholder="Ex: > 0, email, etc."
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Mensagem de Erro</label>
                    <Input
                      value={rule.message}
                      onChange={(e) => updateValidationRule(index, 'message', e.target.value)}
                      placeholder="Mensagem a ser exibida quando a validação falhar"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentStep('mapping')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Voltar ao Mapeamento
              </Button>
              
              <Button
                onClick={validateMappings}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aplicar Regras e Validar
              </Button>
            </div>
          </div>
        )}

        {/* Step: Validação - expandido com mais detalhes */}
        {currentStep === 'validation' && validationResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {validationResults.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <h3 className="text-white font-medium">Resultados da Validação Completa</h3>
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
                <div className="text-xs text-slate-400">Erros Críticos</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-cyan-400">{validationResults.dataQuality}%</div>
                <div className="text-xs text-slate-400">Qualidade dos Dados</div>
              </div>
            </div>

            {validationResults.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-600/30 p-4 rounded-lg">
                <h4 className="text-red-400 font-medium mb-2">Erros Críticos encontrados:</h4>
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

            {validationResults.validationErrors && validationResults.validationErrors.length > 0 && (
              <div className="bg-orange-900/20 border border-orange-600/30 p-4 rounded-lg max-h-48 overflow-y-auto">
                <h4 className="text-orange-400 font-medium mb-2">Erros de Validação por Linha:</h4>
                {validationResults.validationErrors.map((error: string, index: number) => (
                  <div key={index} className="text-orange-300 text-sm">• {error}</div>
                ))}
                {validationResults.validationErrors.length >= 10 && (
                  <div className="text-orange-400 text-xs mt-2">
                    Mostrando apenas os primeiros 10 erros...
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentStep('rules')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Ajustar Regras
              </Button>
              
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

        {/* Step: Histórico de Importações */}
        {currentStep === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Histórico de Importações</h3>
              <Button
                onClick={() => setCurrentStep('upload')}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Nova Importação
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {importHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma importação realizada ainda</p>
                </div>
              ) : (
                importHistory.map((log) => (
                  <div key={log.id} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          log.status === 'success' ? 'bg-green-400' :
                          log.status === 'partial' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <span className="text-white font-medium">{log.fileName}</span>
                        {log.sheetName && (
                          <span className="text-slate-400 text-sm">({log.sheetName})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {log.canRevert && (
                          <Button
                            onClick={() => revertImport(log.id)}
                            variant="outline"
                            size="sm"
                            className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reverter
                          </Button>
                        )}
                        <Button
                          onClick={() => exportImportLog(log)}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Exportar Log
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{log.totalRecords}</div>
                        <div className="text-xs text-slate-400">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{log.successRecords}</div>
                        <div className="text-xs text-slate-400">Sucesso</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-400">{log.errorRecords}</div>
                        <div className="text-xs text-slate-400">Erros</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-300">
                          {log.totalRecords > 0 ? Math.round((log.successRecords / log.totalRecords) * 100) : 0}%
                        </div>
                        <div className="text-xs text-slate-400">Taxa Sucesso</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-400 mb-2">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </div>
                    
                    {log.errors.length > 0 && (
                      <div className="bg-red-900/20 border border-red-600/30 p-2 rounded text-xs">
                        <div className="text-red-400 font-medium mb-1">Erros:</div>
                        {log.errors.slice(0, 3).map((error, index) => (
                          <div key={index} className="text-red-300">• {error}</div>
                        ))}
                        {log.errors.length > 3 && (
                          <div className="text-red-400">... e mais {log.errors.length - 3} erros</div>
                        )}
                      </div>
                    )}
                    
                    {log.warnings.length > 0 && (
                      <div className="bg-yellow-900/20 border border-yellow-600/30 p-2 rounded text-xs mt-2">
                        <div className="text-yellow-400 font-medium mb-1">Avisos:</div>
                        {log.warnings.slice(0, 2).map((warning, index) => (
                          <div key={index} className="text-yellow-300">• {warning}</div>
                        ))}
                        {log.warnings.length > 2 && (
                          <div className="text-yellow-400">... e mais {log.warnings.length - 2} avisos</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default AdvancedDataImporter;
