
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, FileText, DollarSign, TrendingUp, Keyboard } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { DragDropZone } from '@/components/layout/DragDropZone';
import { useToast } from '@/hooks/use-toast';

const Properties = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { toast } = useToast();

  const handlePropertySelect = (propertyId: string) => {
    navigate(`/rms/${propertyId}`);
  };

  const handleFileDrop = (files: FileList) => {
    toast({
      title: "Arquivos recebidos",
      description: `${files.length} arquivo(s) prontos para importação`,
    });
    // Here you would handle the file import logic
    console.log('Files dropped:', Array.from(files).map(f => f.name));
  };

  return (
    <DragDropZone onFileDrop={handleFileDrop}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">
              Sistema RMS Hotelaria
            </h1>
            <p className="text-xl text-slate-300">
              Revenue Management System - Gestão Inteligente de Receitas
            </p>
            
            {/* Keyboard shortcuts hint */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Keyboard className="w-4 h-4" />
              <span>Atalhos: Ctrl+1 Dashboard | Ctrl+2 Executivo | Ctrl+3 Análises | Ctrl+4 Relatórios | Ctrl+5 Financeiro</span>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card 
              className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer group"
              onClick={() => navigate('/executive')}
            >
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white text-lg font-semibold mb-2">Dashboard Executivo</h3>
                <p className="text-slate-400 text-sm">Visão consolidada de todas as propriedades</p>
                <div className="mt-2 text-xs text-slate-500">Ctrl+2</div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer group"
              onClick={() => navigate('/analysis')}
            >
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white text-lg font-semibold mb-2">Análises</h3>
                <p className="text-slate-400 text-sm">Comparações e trending de KPIs</p>
                <div className="mt-2 text-xs text-slate-500">Ctrl+3</div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer group"
              onClick={() => navigate('/reports')}
            >
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white text-lg font-semibold mb-2">Relatórios</h3>
                <p className="text-slate-400 text-sm">Geração de relatórios personalizados</p>
                <div className="mt-2 text-xs text-slate-500">Ctrl+4</div>
              </CardContent>
            </Card>

            <Card 
              className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer group"
              onClick={() => navigate('/financial')}
            >
              <CardContent className="p-6 text-center">
                <DollarSign className="w-12 h-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white text-lg font-semibold mb-2">Financeiro</h3>
                <p className="text-slate-400 text-sm">Gestão financeira e custos</p>
                <div className="mt-2 text-xs text-slate-500">Ctrl+5</div>
              </CardContent>
            </Card>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card
                key={property.id}
                className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer hover:scale-105"
                onClick={() => handlePropertySelect(property.id)}
              >
                <CardContent className="p-6">
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {property.name}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {property.location}, {property.city}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DragDropZone>
  );
};

export default Properties;
