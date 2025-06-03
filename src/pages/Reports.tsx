
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart3, Settings, Download } from 'lucide-react';
import PredefinedReports from '@/components/reports/PredefinedReports';
import ReportBuilder from '@/components/reports/ReportBuilder';
import ReportPreview from '@/components/reports/ReportPreview';
import { useProperties } from '@/hooks/useProperties';

const Reports = () => {
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Sistema de Relatórios
          </h1>
          <p className="text-xl text-slate-300">
            Geração automática de relatórios gerenciais e operacionais
          </p>
        </div>

        {/* Navegação principal */}
        <Tabs defaultValue="predefined" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger 
              value="predefined" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Relatórios Padrão
            </TabsTrigger>
            <TabsTrigger 
              value="builder" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Report Builder
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predefined">
            <PredefinedReports />
          </TabsContent>

          <TabsContent value="builder">
            <ReportBuilder />
          </TabsContent>

          <TabsContent value="preview">
            <ReportPreview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
