
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, TrendingUp, Plus, BarChart3, Calendar, DollarSign, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';
import { CreateProperty } from '@/components/CreateProperty';
import { PropertyGoalProgress } from '@/components/PropertyGoalProgress';

const Properties = () => {
  const navigate = useNavigate();
  const { properties, updatePropertyMeta, addProperty } = useProperties();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/rms/${propertyId}`);
  };

  const handleUpdateMeta = (propertyId: string, newMeta: number) => {
    updatePropertyMeta(propertyId, newMeta);
  };

  const handleCreateProperty = (data: { name: string; location: string; rooms: string; description: string }) => {
    addProperty(data);
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Building2 className="w-10 h-10 text-blue-400" />
            Propriedades
          </h1>
          <p className="text-xl text-slate-300">
            Gerencie suas propriedades e monitore o desempenho
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Propriedade
          </Button>
          <Button
            onClick={() => navigate('/executive')}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard Executivo
          </Button>
        </div>

        {/* Metas de Receita */}
        {properties.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Metas de Receita Mensal</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {properties.map((property) => (
                <PropertyGoalProgress
                  key={property.id}
                  propertyId={property.id}
                  propertyName={property.name}
                  metaMensalReceita={property.metaMensalReceita || 0}
                  onUpdateMeta={(newMeta) => handleUpdateMeta(property.id, newMeta)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => handlePropertyClick(property.id)}
            >
              <CardHeader className="space-y-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-white">{property.name}</CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {property.category}
                  </Badge>
                </div>
                
                {property.image && (
                  <div className="w-full h-32 rounded-lg overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Building2 className="w-4 h-4" />
                  <span>{property.location}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4" />
                  <span>{property.rooms} quartos</span>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">RevPAR</p>
                    <p className="text-sm font-bold text-green-400">
                      R$ {property.revpar?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Ocupação</p>
                    <p className="text-sm font-bold text-blue-400">
                      {property.occupancy || 0}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">ADR</p>
                    <p className="text-sm font-bold text-yellow-400">
                      R$ {property.adr || 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    RMS
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 border-slate-600 text-slate-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/pricing/${property.id}`);
                    }}
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    Pricing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {properties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-400 mb-2">
              Nenhuma propriedade cadastrada
            </h2>
            <p className="text-slate-500 mb-6">
              Comece adicionando sua primeira propriedade
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Propriedade
            </Button>
          </div>
        )}

        {/* Create Property Modal */}
        <CreateProperty 
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateProperty}
        />
      </div>
    </div>
  );
};

export default Properties;
