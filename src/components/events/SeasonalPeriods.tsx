
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEvents, PeriodoSazonal } from '@/hooks/useEvents';
import { Plus, Edit2, Trash2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface SeasonalPeriodsProps {
  propertyId: string;
}

const SeasonalPeriods = ({ propertyId }: SeasonalPeriodsProps) => {
  const { toast } = useToast();
  const { 
    criarPeriodoSazonal, 
    atualizarPeriodoSazonal, 
    excluirPeriodoSazonal, 
    obterPeriodosSazonaisPropriedade 
  } = useEvents();
  
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PeriodoSazonal | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    dataInicio: '',
    dataFim: '',
    temporada: '',
    multiplicadorOcupacao: '',
    multiplicadorADR: ''
  });

  const periodos = obterPeriodosSazonaisPropriedade(propertyId);

  const temporadas = [
    { value: 'alta', label: 'Alta Temporada', color: 'bg-red-500', icon: TrendingUp },
    { value: 'media', label: 'Temporada Média', color: 'bg-yellow-500', icon: TrendingUp },
    { value: 'baixa', label: 'Baixa Temporada', color: 'bg-green-500', icon: TrendingDown }
  ];

  const openPeriodModal = (periodo?: PeriodoSazonal) => {
    if (periodo) {
      setEditingPeriod(periodo);
      setFormData({
        nome: periodo.nome,
        dataInicio: periodo.dataInicio,
        dataFim: periodo.dataFim,
        temporada: periodo.temporada,
        multiplicadorOcupacao: periodo.multiplicadorOcupacao.toString(),
        multiplicadorADR: periodo.multiplicadorADR.toString()
      });
    } else {
      setEditingPeriod(null);
      setFormData({
        nome: '',
        dataInicio: '',
        dataFim: '',
        temporada: '',
        multiplicadorOcupacao: '',
        multiplicadorADR: ''
      });
    }
    setShowPeriodModal(true);
  };

  const handleSavePeriod = () => {
    if (!formData.nome || !formData.dataInicio || !formData.dataFim || !formData.temporada) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const periodoData = {
      propriedadeId: propertyId,
      nome: formData.nome,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      temporada: formData.temporada as PeriodoSazonal['temporada'],
      multiplicadorOcupacao: Number(formData.multiplicadorOcupacao) || 1,
      multiplicadorADR: Number(formData.multiplicadorADR) || 1,
      ativo: true,
      cor: temporadas.find(t => t.value === formData.temporada)?.color
    };

    if (editingPeriod) {
      atualizarPeriodoSazonal(editingPeriod.id, periodoData);
    } else {
      criarPeriodoSazonal(periodoData);
    }

    setShowPeriodModal(false);
  };

  const handleDeletePeriod = (periodo: PeriodoSazonal) => {
    if (window.confirm(`Tem certeza que deseja excluir o período "${periodo.nome}"?`)) {
      excluirPeriodoSazonal(periodo.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Períodos Sazonais</h2>
          <p className="text-slate-400">Configure temporadas e seus multiplicadores</p>
        </div>
        <Button 
          onClick={() => openPeriodModal()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Período
        </Button>
      </div>

      {/* Lista de períodos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {periodos.length === 0 ? (
          <Card className="col-span-full bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">
                Nenhum período sazonal configurado
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Crie períodos sazonais para aplicar multiplicadores automáticos
              </p>
            </CardContent>
          </Card>
        ) : (
          periodos.map((periodo) => {
            const temporada = temporadas.find(t => t.value === periodo.temporada);
            const Icon = temporada?.icon || Calendar;
            
            return (
              <Card key={periodo.id} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{periodo.nome}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${temporada?.color} text-white text-xs`}>
                          {temporada?.label}
                        </Badge>
                        {periodo.ativo && (
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            Ativo
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openPeriodModal(periodo)}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-blue-400"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePeriod(periodo)}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-slate-400">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      {periodo.dataInicio} até {periodo.dataFim}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-700/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Icon className="w-4 h-4" />
                        Ocupação
                      </div>
                      <div className="text-white font-medium">
                        {(periodo.multiplicadorOcupacao * 100 - 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-slate-700/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Icon className="w-4 h-4" />
                        ADR
                      </div>
                      <div className="text-white font-medium">
                        {(periodo.multiplicadorADR * 100 - 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de criação/edição */}
      <Dialog open={showPeriodModal} onOpenChange={setShowPeriodModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPeriod ? 'Editar Período Sazonal' : 'Novo Período Sazonal'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nome do Período *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Ex: Verão"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Tipo de Temporada *</Label>
              <Select value={formData.temporada} onValueChange={(value) => setFormData(prev => ({ ...prev, temporada: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione a temporada" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {temporadas.map((temporada) => (
                    <SelectItem key={temporada.value} value={temporada.value} className="text-white">
                      {temporada.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Data Início (MM-DD) *</Label>
              <Input
                value={formData.dataInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="12-21"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Data Fim (MM-DD) *</Label>
              <Input
                value={formData.dataFim}
                onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="03-20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Multiplicador Ocupação</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.multiplicadorOcupacao}
                onChange={(e) => setFormData(prev => ({ ...prev, multiplicadorOcupacao: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="1.2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Multiplicador ADR</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.multiplicadorADR}
                onChange={(e) => setFormData(prev => ({ ...prev, multiplicadorADR: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="1.3"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSavePeriod}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {editingPeriod ? 'Atualizar' : 'Criar'} Período
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowPeriodModal(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeasonalPeriods;
