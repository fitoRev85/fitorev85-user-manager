
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, Database, FileText, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const DataManagement = () => {
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: 1,
      filename: 'occupancy_data_2024_01.csv',
      type: 'occupancy',
      uploadDate: '2024-01-07 10:30',
      status: 'processed',
      records: 31,
      errors: 0
    },
    {
      id: 2,
      filename: 'competitors_data_jan.csv',
      type: 'competitive',
      uploadDate: '2024-01-07 09:15',
      status: 'processing',
      records: 156,
      errors: 2
    },
    {
      id: 3,
      filename: 'events_calendar_2024.csv',
      type: 'events',
      uploadDate: '2024-01-06 16:45',
      status: 'completed',
      records: 89,
      errors: 0
    }
  ]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dataType, setDataType] = useState('occupancy');
  const [validationResults, setValidationResults] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Simula validação do arquivo
      setTimeout(() => {
        setValidationResults({
          isValid: true,
          records: 45,
          columns: ['date', 'room_type', 'occupancy', 'adr', 'revpar'],
          errors: [],
          warnings: ['2 registros com datas duplicadas foram encontrados']
        });
      }, 1000);
    }
  };

  const processUpload = () => {
    if (selectedFile) {
      const newUpload = {
        id: Date.now(),
        filename: selectedFile.name,
        type: dataType,
        uploadDate: new Date().toLocaleString('pt-BR'),
        status: 'processing',
        records: validationResults?.records || 0,
        errors: validationResults?.errors?.length || 0
      };
      
      setUploadHistory([newUpload, ...uploadHistory]);
      setSelectedFile(null);
      setValidationResults(null);
      
      // Simula processamento
      setTimeout(() => {
        setUploadHistory(prev => prev.map(upload =>
          upload.id === newUpload.id ? { ...upload, status: 'completed' } : upload
        ));
      }, 3000);
    }
  };

  const downloadTemplate = (type) => {
    console.log(`Downloading template for ${type}`);
    // Aqui seria feito o download do template CSV
  };

  const exportData = (format) => {
    console.log(`Exporting data in ${format} format`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'occupancy': return 'Ocupação';
      case 'competitive': return 'Competitivo';
      case 'events': return 'Eventos';
      case 'financial': return 'Financeiro';
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
            Upload de Dados
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
                <option value="occupancy">Dados de Ocupação</option>
                <option value="competitive">Dados Competitivos</option>
                <option value="events">Calendário de Eventos</option>
                <option value="financial">Dados Financeiros</option>
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

              {validationResults.warnings.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-yellow-400 mb-1">Avisos:</div>
                  {validationResults.warnings.map((warning, index) => (
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
                  onClick={() => setValidationResults(null)}
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
            <div className="text-2xl font-bold text-blue-400">12,547</div>
            <p className="text-xs text-slate-400">Últimos 90 dias</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Uploads Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">98</div>
            <p className="text-xs text-slate-400">Este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">97.2%</div>
            <p className="text-xs text-slate-400">Processamento sem erros</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataManagement;
