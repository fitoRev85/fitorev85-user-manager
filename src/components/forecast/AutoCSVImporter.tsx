
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, CheckCircle, AlertTriangle, MapPin, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutoCSVImporterProps {
  propertyId: string;
}

interface ColumnMapping {
  csvColumn: string;
  systemField: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'email';
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalRecords: number;
  validRecords: number;
  duplicates: number;
}

const AutoCSVImporter = ({ propertyId }: AutoCSVImporterProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadStep, setUploadStep] = useState<'select' | 'validate' | 'map' | 'confirm' | 'import'>('select');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importing, setImporting] = useState(false);

  // Campos padrão do sistema para mapeamento
  const systemFields = [
    { key: 'hotelID', label: 'ID do Hotel', type: 'string', required: true },
    { key: 'bookingInternalID', label: 'ID da Reserva', type: 'string', required: true },
    { key: 'status', label: 'Status da Reserva', type: 'string', required: true },
    { key: 'roomTypeDescription', label: 'Tipo de Quarto', type: 'string', required: false },
    { key: 'checkInDateTime', label: 'Data Check-in', type: 'date', required: true },
    { key: 'checkOutDateTime', label: 'Data Check-out', type: 'date', required: true },
    { key: 'totalBookingRate', label: 'Valor Total', type: 'number', required: true },
    { key: 'mainGuest_name', label: 'Nome do Hóspede', type: 'string', required: true },
    { key: 'mainGuest_email', label: 'Email do Hóspede', type: 'email', required: false },
    { key: 'mainGuest_phone', label: 'Telefone do Hóspede', type: 'string', required: false },
    { key: 'channelDescription', label: 'Canal de Venda', type: 'string', required: false },
    { key: 'createdAt', label: 'Data de Criação', type: 'date', required: false },
    { key: 'guestCount', label: 'Número de Hóspedes', type: 'number', required: false },
    { key: 'roomNumber', label: 'Número do Quarto', type: 'string', required: false },
    { key: 'specialRequests', label: 'Solicitações Especiais', type: 'string', required: false }
  ];

  const parseCSVFile = async (file: File): Promise<{ headers: string[], data: any[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length === 0) {
            reject(new Error('Arquivo CSV vazio'));
            return;
          }

          // Parse headers
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          // Parse data
          const data = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = { _rowIndex: index + 2 }; // +2 because we start from line 1 and skip header
            
            headers.forEach((header, i) => {
              row[header] = values[i] || '';
            });
            
            return row;
          });

          resolve({ headers, data });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
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

    try {
      setFileName(file.name);
      const { headers, data } = await parseCSVFile(file);
      
      setCsvHeaders(headers);
      setCsvData(data);
      setUploadStep('validate');
      
      // Auto-validate
      validateCSVData(headers, data);
      
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };

  const validateCSVData = (headers: string[], data: any[]) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validRecords = 0;
    let duplicates = 0;

    // Verificar se headers principais estão presentes
    const requiredHeaders = ['bookingInternalID', 'checkInDateTime', 'totalBookingRate'];
    const missingHeaders = requiredHeaders.filter(header => 
      !headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
    );

    if (missingHeaders.length > 0) {
      errors.push(`Colunas obrigatórias não encontradas: ${missingHeaders.join(', ')}`);
    }

    // Verificar duplicatas por ID de reserva
    const bookingIds = new Set();
    const duplicateIds = new Set();

    data.forEach((row, index) => {
      let rowValid = true;
      const bookingId = row.bookingInternalID || row.bookingid || row.booking_id || '';
      
      if (bookingId) {
        if (bookingIds.has(bookingId)) {
          duplicateIds.add(bookingId);
          duplicates++;
        } else {
          bookingIds.add(bookingId);
        }
      } else {
        rowValid = false;
        warnings.push(`Linha ${index + 2}: ID de reserva não encontrado`);
      }

      // Validar valores numéricos
      const totalValue = row.totalBookingRate || row.total || row.valor || '';
      if (totalValue && isNaN(parseFloat(totalValue.toString().replace(',', '.')))) {
        rowValid = false;
        warnings.push(`Linha ${index + 2}: Valor total inválido`);
      }

      // Validar datas
      const checkIn = row.checkInDateTime || row.checkin || row.data_checkin || '';
      if (checkIn && isNaN(Date.parse(checkIn))) {
        warnings.push(`Linha ${index + 2}: Data de check-in inválida`);
      }

      if (rowValid) validRecords++;
    });

    if (duplicateIds.size > 0) {
      warnings.push(`${duplicates} registros duplicados encontrados`);
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalRecords: data.length,
      validRecords,
      duplicates
    };

    setValidationResult(result);

    if (result.isValid) {
      // Auto-gerar mapeamentos sugeridos
      generateSuggestedMappings(headers);
      setUploadStep('map');
    }
  };

  const generateSuggestedMappings = (headers: string[]) => {
    const mappings: ColumnMapping[] = [];

    systemFields.forEach(field => {
      const matchedHeader = headers.find(header => 
        header.toLowerCase().includes(field.key.toLowerCase()) ||
        field.key.toLowerCase().includes(header.toLowerCase())
      );

      if (matchedHeader) {
        mappings.push({
          csvColumn: matchedHeader,
          systemField: field.key,
          required: field.required,
          type: field.type as any
        });
      }
    });

    setColumnMappings(mappings);
  };

  const updateColumnMapping = (index: number, field: 'csvColumn' | 'systemField', value: string) => {
    const updatedMappings = [...columnMappings];
    updatedMappings[index] = { ...updatedMappings[index], [field]: value };
    setColumnMappings(updatedMappings);
  };

  const addColumnMapping = () => {
    setColumnMappings([...columnMappings, {
      csvColumn: '',
      systemField: '',
      required: false,
      type: 'string'
    }]);
  };

  const removeColumnMapping = (index: number) => {
    setColumnMappings(columnMappings.filter((_, i) => i !== index));
  };

  const proceedToConfirm = () => {
    // Validar mapeamentos obrigatórios
    const requiredFields = systemFields.filter(f => f.required);
    const mappedRequiredFields = columnMappings.filter(m => 
      requiredFields.some(rf => rf.key === m.systemField)
    );

    if (mappedRequiredFields.length < requiredFields.length) {
      toast({
        title: "Mapeamento incompleto",
        description: "Por favor, mapeie todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setUploadStep('confirm');
  };

  const executeImport = async () => {
    setImporting(true);
    
    try {
      // Transformar dados conforme mapeamento
      const transformedData = csvData.map(row => {
        const transformedRow: any = {
          id: generateUniqueId(),
          propertyId,
          importedAt: new Date().toISOString(),
          fileName,
          originalRowIndex: row._rowIndex
        };

        columnMappings.forEach(mapping => {
          if (mapping.csvColumn && mapping.systemField) {
            let value = row[mapping.csvColumn];

            // Transformar conforme tipo
            switch (mapping.type) {
              case 'number':
                value = value ? parseFloat(value.toString().replace(',', '.')) : null;
                break;
              case 'date':
                value = value ? new Date(value).toISOString() : null;
                break;
              case 'email':
                value = value ? value.toLowerCase() : '';
                break;
              default:
                value = value ? value.toString() : '';
            }

            transformedRow[mapping.systemField] = value;
          }
        });

        return transformedRow;
      });

      // Salvar no localStorage (simulando banco de dados)
      const storageKey = `reservations_data_${propertyId}`;
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedData = [...existingData, ...transformedData];
      
      localStorage.setItem(storageKey, JSON.stringify(updatedData));

      // Atualizar índice geral
      const indexKey = `data_index_${propertyId}`;
      const existingIndex = JSON.parse(localStorage.getItem(indexKey) || '{}');
      existingIndex.reservations = {
        lastUpdated: new Date().toISOString(),
        records: updatedData.length,
        lastImport: {
          fileName,
          recordsAdded: transformedData.length,
          timestamp: new Date().toISOString()
        }
      };
      localStorage.setItem(indexKey, JSON.stringify(existingIndex));

      toast({
        title: "Importação concluída!",
        description: `${transformedData.length} registros importados com sucesso.`,
      });

      // Reset
      resetImporter();
      
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: `Erro ao salvar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
    
    setImporting(false);
  };

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const resetImporter = () => {
    setUploadStep('select');
    setCsvData([]);
    setCsvHeaders([]);
    setFileName('');
    setValidationResult(null);
    setColumnMappings([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-green-400" />
          Importação Automática de CSV - Propriedade: {propertyId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Step 1: Seleção de Arquivo */}
        {uploadStep === 'select' && (
          <div className="text-center space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Selecione seu arquivo CSV</h3>
              <p className="text-slate-400 text-sm mb-4">
                Suporta arquivos CSV com estrutura de reservas padronizada
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo CSV
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Validação */}
        {uploadStep === 'validate' && validationResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <h3 className="text-white font-medium">
                Validação do arquivo: {fileName}
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-400">{validationResult.totalRecords}</div>
                <div className="text-xs text-slate-400">Total de Registros</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-green-400">{validationResult.validRecords}</div>
                <div className="text-xs text-slate-400">Registros Válidos</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-red-400">{validationResult.errors.length}</div>
                <div className="text-xs text-slate-400">Erros</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-yellow-400">{validationResult.warnings.length}</div>
                <div className="text-xs text-slate-400">Avisos</div>
              </div>
            </div>

            {validationResult.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-600/30 p-4 rounded-lg">
                <h4 className="text-red-400 font-medium mb-2">Erros encontrados:</h4>
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="text-red-300 text-sm">• {error}</div>
                ))}
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
                <h4 className="text-yellow-400 font-medium mb-2">Avisos:</h4>
                {validationResult.warnings.map((warning, index) => (
                  <div key={index} className="text-yellow-300 text-sm">• {warning}</div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {validationResult.isValid ? (
                <Button
                  onClick={() => setUploadStep('map')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continuar para Mapeamento
                </Button>
              ) : (
                <Button
                  onClick={resetImporter}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Selecionar Outro Arquivo
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Mapeamento de Colunas */}
        {uploadStep === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-medium">Mapeamento de Colunas</h3>
            </div>

            <div className="space-y-3">
              {columnMappings.map((mapping, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Coluna do CSV</label>
                    <select
                      value={mapping.csvColumn}
                      onChange={(e) => updateColumnMapping(index, 'csvColumn', e.target.value)}
                      className="w-full bg-slate-700 border-slate-600 text-white rounded px-3 py-2 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {csvHeaders.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Campo do Sistema</label>
                    <select
                      value={mapping.systemField}
                      onChange={(e) => updateColumnMapping(index, 'systemField', e.target.value)}
                      className="w-full bg-slate-700 border-slate-600 text-white rounded px-3 py-2 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {systemFields.map(field => (
                        <option key={field.key} value={field.key}>
                          {field.label} {field.required && '*'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() => removeColumnMapping(index)}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={addColumnMapping}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Adicionar Mapeamento
              </Button>
              
              <Button
                onClick={proceedToConfirm}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirmar Mapeamentos
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmação */}
        {uploadStep === 'confirm' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-medium">Confirmar Importação</h3>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-3">Resumo da Importação:</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Arquivo:</span>
                  <span className="text-white">{fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Registros a importar:</span>
                  <span className="text-white">{validationResult?.validRecords || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Campos mapeados:</span>
                  <span className="text-white">{columnMappings.filter(m => m.csvColumn && m.systemField).length}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setUploadStep('map')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Voltar ao Mapeamento
              </Button>
              
              <Button
                onClick={executeImport}
                disabled={importing}
                className="bg-green-600 hover:bg-green-700"
              >
                {importing ? 'Importando...' : 'Confirmar Importação'}
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default AutoCSVImporter;
