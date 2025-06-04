
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertThreshold } from '@/hooks/useAlerts';
import { useProperties } from '@/hooks/useProperties';

interface ThresholdConfigProps {
  thresholds: AlertThreshold[];
  onAddThreshold: (threshold: Omit<AlertThreshold, 'id'>) => void;
  onUpdateThreshold: (id: string, updates: Partial<AlertThreshold>) => void;
  onDeleteThreshold: (id: string) => void;
}

const ThresholdConfig = ({ 
  thresholds, 
  onAddThreshold, 
  onUpdateThreshold, 
  onDeleteThreshold 
}: ThresholdConfigProps) => {
  const { properties } = useProperties();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<AlertThreshold | null>(null);
  const [newThreshold, setNewThreshold] = useState<Omit<AlertThreshold, 'id'>>({
    propertyId: '',
    metric: 'occupancy',
    threshold: 0,
    operator: 'below',
    priority: 'medium',
    name: '',
    enabled: true
  });

  const handleAddThreshold = () => {
    if (newThreshold.propertyId && newThreshold.name && newThreshold.threshold > 0) {
      onAddThreshold(newThreshold);
      setNewThreshold({
        propertyId: '',
        metric: 'occupancy',
        threshold: 0,
        operator: 'below',
        priority: 'medium',
        name: '',
        enabled: true
      });
      setShowAddDialog(false);
    }
  };

  const handleEditThreshold = (threshold: AlertThreshold) => {
    setEditingThreshold(threshold);
    setNewThreshold({
      propertyId: threshold.propertyId,
      metric: threshold.metric,
      threshold: threshold.threshold,
      operator: threshold.operator,
      priority: threshold.priority,
      name: threshold.name,
      enabled: threshold.enabled
    });
    setShowAddDialog(true);
  };

  const handleUpdateThreshold = () => {
    if (editingThreshold && newThreshold.name && newThreshold.threshold > 0) {
      onUpdateThreshold(editingThreshold.id, newThreshold);
      setEditingThreshold(null);
      setNewThreshold({
        propertyId: '',
        metric: 'occupancy',
        threshold: 0,
        operator: 'below',
        priority: 'medium',
        name: '',
        enabled: true
      });
      setShowAddDialog(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getMetricLabel = (metric: string) => {
    const labels = {
      occupancy: 'Ocupação (%)',
      adr: 'ADR (R$)',
      revenue: 'Receita (R$)',
      cancellation: 'Cancelamento (%)'
    };
    return labels[metric as keyof typeof labels] || metric;
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            Configuração de Thresholds
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setEditingThreshold(null);
                  setNewThreshold({
                    propertyId: '',
                    metric: 'occupancy',
                    threshold: 0,
                    operator: 'below',
                    priority: 'medium',
                    name: '',
                    enabled: true
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Threshold
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingThreshold ? 'Editar Threshold' : 'Novo Threshold'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome</label>
                  <Input
                    value={newThreshold.name}
                    onChange={(e) => setNewThreshold({...newThreshold, name: e.target.value})}
                    placeholder="Ex: Ocupação Baixa"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Propriedade</label>
                  <Select 
                    value={newThreshold.propertyId} 
                    onValueChange={(value) => setNewThreshold({...newThreshold, propertyId: value})}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione a propriedade" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {properties.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Métrica</label>
                    <Select 
                      value={newThreshold.metric} 
                      onValueChange={(value: 'occupancy' | 'adr' | 'revenue' | 'cancellation') => setNewThreshold({...newThreshold, metric: value})}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="occupancy">Ocupação</SelectItem>
                        <SelectItem value="adr">ADR</SelectItem>
                        <SelectItem value="revenue">Receita</SelectItem>
                        <SelectItem value="cancellation">Cancelamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Operador</label>
                    <Select 
                      value={newThreshold.operator} 
                      onValueChange={(value: 'above' | 'below') => setNewThreshold({...newThreshold, operator: value})}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="below">Abaixo de</SelectItem>
                        <SelectItem value="above">Acima de</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Valor</label>
                    <Input
                      type="number"
                      value={newThreshold.threshold}
                      onChange={(e) => setNewThreshold({...newThreshold, threshold: Number(e.target.value)})}
                      placeholder="0"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Prioridade</label>
                    <Select 
                      value={newThreshold.priority} 
                      onValueChange={(value: 'low' | 'medium' | 'high') => setNewThreshold({...newThreshold, priority: value})}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={editingThreshold ? handleUpdateThreshold : handleAddThreshold}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {editingThreshold ? 'Atualizar' : 'Criar'} Threshold
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {thresholds.map((threshold) => {
            const property = properties.find(p => p.id === threshold.propertyId);
            return (
              <div key={threshold.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{threshold.name}</h4>
                    <Badge className={getPriorityColor(threshold.priority)}>
                      {threshold.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300">
                    {property?.name} • {getMetricLabel(threshold.metric)} {threshold.operator === 'above' ? '>' : '<'} {threshold.threshold}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={threshold.enabled}
                    onCheckedChange={(checked) => onUpdateThreshold(threshold.id, { enabled: checked })}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditThreshold(threshold)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteThreshold(threshold.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {thresholds.length === 0 && (
            <div className="text-center py-6">
              <Settings className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400">Nenhum threshold configurado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThresholdConfig;
