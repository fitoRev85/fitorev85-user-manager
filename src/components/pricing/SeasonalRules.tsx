
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { usePricingRules, PricingRule } from '@/hooks/usePricingRules';

interface SeasonalRulesProps {
  propertyId: string;
}

const SeasonalRules = ({ propertyId }: SeasonalRulesProps) => {
  const { rules, addRule, updateRule, deleteRule } = usePricingRules(propertyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    season: 'media' as 'alta' | 'media' | 'baixa',
    startMonth: 1,
    endMonth: 12,
    multiplier: 1.0,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRule) {
      updateRule(editingRule.id, formData);
    } else {
      addRule(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      season: 'media',
      startMonth: 1,
      endMonth: 12,
      multiplier: 1.0,
      description: ''
    });
    setEditingRule(null);
  };

  const handleEdit = (rule: PricingRule) => {
    setFormData({
      name: rule.name,
      season: rule.season,
      startMonth: rule.startMonth,
      endMonth: rule.endMonth,
      multiplier: rule.multiplier,
      description: rule.description || ''
    });
    setEditingRule(rule);
    setIsDialogOpen(true);
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'alta': return 'bg-red-500/20 text-red-400';
      case 'media': return 'bg-yellow-500/20 text-yellow-400';
      case 'baixa': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Regras Sazonais</h2>
          <p className="text-slate-400">Configure multiplicadores de preço por temporada</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Editar Regra' : 'Nova Regra Sazonal'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Regra</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-700 border-slate-600"
                  placeholder="Ex: Alta Temporada - Verão"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Temporada</Label>
                <Select 
                  value={formData.season} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, season: value }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta Temporada</SelectItem>
                    <SelectItem value="media">Temporada Média</SelectItem>
                    <SelectItem value="baixa">Baixa Temporada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mês Inicial</Label>
                  <Select 
                    value={formData.startMonth.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, startMonth: Number(value) }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {getMonthName(i + 1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mês Final</Label>
                  <Select 
                    value={formData.endMonth.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, endMonth: Number(value) }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {getMonthName(i + 1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Multiplicador de Preço</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="3.0"
                  value={formData.multiplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, multiplier: Number(e.target.value) }))}
                  className="bg-slate-700 border-slate-600"
                  placeholder="1.0"
                  required
                />
                <p className="text-xs text-slate-400">
                  1.0 = preço normal, 1.5 = 50% mais caro, 0.8 = 20% desconto
                </p>
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-700 border-slate-600"
                  placeholder="Descrição da temporada"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingRule ? 'Atualizar' : 'Criar'} Regra
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setIsDialogOpen(false); resetForm(); }}
                  className="border-slate-600"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Regras */}
      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                    <Badge className={getSeasonColor(rule.season)}>
                      {rule.season.charAt(0).toUpperCase() + rule.season.slice(1)} Temporada
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>
                      {getMonthName(rule.startMonth)} - {getMonthName(rule.endMonth)}
                    </span>
                    <span>•</span>
                    <span className="text-blue-400 font-medium">
                      {rule.multiplier}x multiplicador
                    </span>
                    <span>•</span>
                    <span className={rule.multiplier > 1 ? 'text-red-400' : rule.multiplier < 1 ? 'text-green-400' : 'text-slate-400'}>
                      {rule.multiplier > 1 
                        ? `+${((rule.multiplier - 1) * 100).toFixed(0)}%`
                        : rule.multiplier < 1 
                        ? `-${((1 - rule.multiplier) * 100).toFixed(0)}%`
                        : 'Preço base'
                      }
                    </span>
                  </div>
                  
                  {rule.description && (
                    <p className="text-slate-400 text-sm">{rule.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {rules.length === 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-8 text-center">
              <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma regra configurada</h3>
              <p className="text-slate-400 mb-4">
                Configure regras sazonais para automatizar os preços
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SeasonalRules;
