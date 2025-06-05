import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEvents, Evento } from '@/hooks/useEvents';
import { Plus, Edit2, Trash2, MapPin, Clock, TrendingUp } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

interface EventsCalendarProps {
  propertyId: string;
}

const EventsCalendar = ({ propertyId }: EventsCalendarProps) => {
  const { toast } = useToast();
  const { 
    criarEvento, 
    atualizarEvento, 
    excluirEvento, 
    obterEventosPropriedade 
  } = useEvents();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    tipo: '',
    impacto: '',
    impactoOcupacao: '',
    impactoADR: '',
    recorrente: false
  });

  const eventos = obterEventosPropriedade(propertyId);

  const tiposEvento = [
    { value: 'feriado', label: 'Feriado', color: 'bg-red-500' },
    { value: 'evento_local', label: 'Evento Local', color: 'bg-blue-500' },
    { value: 'congresso', label: 'Congresso', color: 'bg-purple-500' },
    { value: 'feira', label: 'Feira', color: 'bg-green-500' },
    { value: 'show', label: 'Show/Espetáculo', color: 'bg-pink-500' },
    { value: 'esportivo', label: 'Evento Esportivo', color: 'bg-orange-500' },
    { value: 'outro', label: 'Outro', color: 'bg-gray-500' }
  ];

  const niveisImpacto = [
    { value: 'alto', label: 'Alto', color: 'text-red-400' },
    { value: 'medio', label: 'Médio', color: 'text-yellow-400' },
    { value: 'baixo', label: 'Baixo', color: 'text-green-400' }
  ];

  const openEventModal = (evento?: Evento) => {
    if (evento) {
      setEditingEvent(evento);
      setFormData({
        nome: evento.nome,
        descricao: evento.descricao || '',
        dataInicio: evento.dataInicio,
        dataFim: evento.dataFim,
        tipo: evento.tipo,
        impacto: evento.impacto,
        impactoOcupacao: evento.impactoOcupacao.toString(),
        impactoADR: evento.impactoADR.toString(),
        recorrente: evento.recorrente
      });
    } else {
      setEditingEvent(null);
      setFormData({
        nome: '',
        descricao: '',
        dataInicio: format(selectedDate, 'yyyy-MM-dd'),
        dataFim: format(selectedDate, 'yyyy-MM-dd'),
        tipo: '',
        impacto: '',
        impactoOcupacao: '',
        impactoADR: '',
        recorrente: false
      });
    }
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!formData.nome || !formData.dataInicio || !formData.dataFim || !formData.tipo || !formData.impacto) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const eventoData = {
      propriedadeId: propertyId,
      nome: formData.nome,
      descricao: formData.descricao,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      tipo: formData.tipo as Evento['tipo'],
      impacto: formData.impacto as Evento['impacto'],
      impactoOcupacao: Number(formData.impactoOcupacao) || 0,
      impactoADR: Number(formData.impactoADR) || 0,
      recorrente: formData.recorrente,
      ativo: true,
      cor: tiposEvento.find(t => t.value === formData.tipo)?.color
    };

    if (editingEvent) {
      atualizarEvento(editingEvent.id, eventoData);
    } else {
      criarEvento(eventoData);
    }

    setShowEventModal(false);
  };

  const handleDeleteEvent = (evento: Evento) => {
    if (window.confirm(`Tem certeza que deseja excluir o evento "${evento.nome}"?`)) {
      excluirEvento(evento.id);
    }
  };

  const getEventosDoMes = (mes: number, ano: number) => {
    return eventos.filter(evento => {
      const dataInicio = parseISO(evento.dataInicio);
      const dataFim = parseISO(evento.dataFim);
      const primeiroDiaDoMes = new Date(ano, mes, 1);
      const ultimoDiaDoMes = new Date(ano, mes + 1, 0);
      
      return (dataInicio <= ultimoDiaDoMes && dataFim >= primeiroDiaDoMes);
    });
  };

  const getEventosDoMesAtual = () => {
    return getEventosDoMes(selectedDate.getMonth(), selectedDate.getFullYear());
  };

  const getEventosDoDia = (data: Date) => {
    return eventos.filter(evento => {
      const dataInicio = parseISO(evento.dataInicio);
      const dataFim = parseISO(evento.dataFim);
      return data >= dataInicio && data <= dataFim;
    });
  };

  const eventosDoMes = getEventosDoMesAtual();
  const eventosDoDia = getEventosDoDia(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendário de Eventos</h2>
          <p className="text-slate-400">Gerencie eventos e seu impacto nas previsões</p>
        </div>
        <Button 
          onClick={() => openEventModal()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border border-slate-700"
              components={{
                DayContent: ({ date }) => {
                  const eventosNoDia = getEventosDoDia(date);
                  return (
                    <div className="relative w-full h-full">
                      <span>{date.getDate()}</span>
                      {eventosNoDia.length > 0 && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Eventos do dia selecionado */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventosDoDia.length === 0 ? (
              <p className="text-slate-400 text-center py-4">
                Nenhum evento neste dia
              </p>
            ) : (
              eventosDoDia.map((evento) => {
                const tipoEvento = tiposEvento.find(t => t.value === evento.tipo);
                const nivelImpacto = niveisImpacto.find(n => n.value === evento.impacto);
                
                return (
                  <div key={evento.id} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{evento.nome}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${tipoEvento?.color} text-white text-xs`}>
                            {tipoEvento?.label}
                          </Badge>
                          <span className={`text-xs ${nivelImpacto?.color}`}>
                            {nivelImpacto?.label}
                          </span>
                        </div>
                        {evento.descricao && (
                          <p className="text-xs text-slate-400 mt-1">{evento.descricao}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span>Ocupação: +{evento.impactoOcupacao}%</span>
                          <span>ADR: +{evento.impactoADR}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEventModal(evento)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-blue-400"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEvent(evento)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo dos eventos do mês */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Eventos do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {eventosDoMes.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Nenhum evento programado para este mês
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventosDoMes.map((evento) => {
                const tipoEvento = tiposEvento.find(t => t.value === evento.tipo);
                const nivelImpacto = niveisImpacto.find(n => n.value === evento.impacto);
                
                return (
                  <div key={evento.id} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{evento.nome}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEventModal(evento)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-blue-400"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEvent(evento)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${tipoEvento?.color} text-white text-xs`}>
                        {tipoEvento?.label}
                      </Badge>
                      <span className={`text-xs ${nivelImpacto?.color}`}>
                        {nivelImpacto?.label}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(parseISO(evento.dataInicio), 'dd/MM', { locale: ptBR })} - {format(parseISO(evento.dataFim), 'dd/MM', { locale: ptBR })}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{evento.impactoOcupacao}% ocupação
                      </div>
                      <div>+{evento.impactoADR}% ADR</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de criação/edição de evento */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nome do Evento *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Ex: Rock in Rio"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {tiposEvento.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value} className="text-white">
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Data Início *</Label>
              <Input
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Data Fim *</Label>
              <Input
                type="date"
                value={formData.dataFim}
                onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Nível de Impacto *</Label>
              <Select value={formData.impacto} onValueChange={(value) => setFormData(prev => ({ ...prev, impacto: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o impacto" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {niveisImpacto.map((impacto) => (
                    <SelectItem key={impacto.value} value={impacto.value} className="text-white">
                      {impacto.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Impacto Ocupação (%)</Label>
              <Input
                type="number"
                value={formData.impactoOcupacao}
                onChange={(e) => setFormData(prev => ({ ...prev, impactoOcupacao: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Ex: 20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Impacto ADR (%)</Label>
              <Input
                type="number"
                value={formData.impactoADR}
                onChange={(e) => setFormData(prev => ({ ...prev, impactoADR: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Ex: 15"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Detalhes sobre o evento..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recorrente"
              checked={formData.recorrente}
              onChange={(e) => setFormData(prev => ({ ...prev, recorrente: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="recorrente" className="text-slate-300">
              Evento recorrente (anual)
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSaveEvent}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {editingEvent ? 'Atualizar' : 'Criar'} Evento
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowEventModal(false)}
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

export default EventsCalendar;
