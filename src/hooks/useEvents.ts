
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Evento {
  id: string;
  propriedadeId: string;
  nome: string;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
  tipo: 'feriado' | 'evento_local' | 'congresso' | 'feira' | 'show' | 'esportivo' | 'outro';
  impacto: 'alto' | 'medio' | 'baixo';
  impactoOcupacao: number; // % de aumento esperado
  impactoADR: number; // % de aumento esperado
  recorrente: boolean;
  ativo: boolean;
  cor?: string;
}

export interface PeriodoSazonal {
  id: string;
  propriedadeId: string;
  nome: string;
  dataInicio: string; // MM-DD format para recorrência anual
  dataFim: string; // MM-DD format para recorrência anual
  temporada: 'alta' | 'media' | 'baixa';
  multiplicadorOcupacao: number;
  multiplicadorADR: number;
  ativo: boolean;
  cor?: string;
}

export interface EventoAlert {
  id: string;
  eventoId: string;
  tipo: 'evento_proximo' | 'temporada_mudando' | 'oportunidade_pricing';
  titulo: string;
  descricao: string;
  data: string;
  prioridade: 'alta' | 'media' | 'baixa';
  visualizado: boolean;
}

export function useEvents() {
  const { toast } = useToast();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [periodosSazonais, setPeriodosSazonais] = useState<PeriodoSazonal[]>([]);
  const [alerts, setAlerts] = useState<EventoAlert[]>([]);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const eventosData = localStorage.getItem('eventos_data');
    const periodosData = localStorage.getItem('periodos_sazonais_data');
    const alertsData = localStorage.getItem('eventos_alerts_data');

    if (eventosData) {
      try {
        setEventos(JSON.parse(eventosData));
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    }

    if (periodosData) {
      try {
        setPeriodosSazonais(JSON.parse(periodosData));
      } catch (error) {
        console.error('Erro ao carregar períodos sazonais:', error);
      }
    }

    if (alertsData) {
      try {
        setAlerts(JSON.parse(alertsData));
      } catch (error) {
        console.error('Erro ao carregar alertas:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('eventos_data', JSON.stringify(eventos));
  }, [eventos]);

  useEffect(() => {
    localStorage.setItem('periodos_sazonais_data', JSON.stringify(periodosSazonais));
  }, [periodosSazonais]);

  useEffect(() => {
    localStorage.setItem('eventos_alerts_data', JSON.stringify(alerts));
  }, [alerts]);

  // Funções para gerenciar eventos
  const criarEvento = (evento: Omit<Evento, 'id'>) => {
    const novoEvento: Evento = {
      ...evento,
      id: `evento_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setEventos(prev => [...prev, novoEvento]);
    
    toast({
      title: "Evento criado",
      description: `Evento "${evento.nome}" foi criado com sucesso`,
    });

    // Gerar alertas automáticos
    gerarAlertas(novoEvento);
  };

  const atualizarEvento = (id: string, dadosAtualizados: Partial<Evento>) => {
    setEventos(prev => prev.map(evento => 
      evento.id === id ? { ...evento, ...dadosAtualizados } : evento
    ));
    
    toast({
      title: "Evento atualizado",
      description: "Evento foi atualizado com sucesso",
    });
  };

  const excluirEvento = (id: string) => {
    setEventos(prev => prev.filter(evento => evento.id !== id));
    setAlerts(prev => prev.filter(alert => alert.eventoId !== id));
    
    toast({
      title: "Evento excluído",
      description: "Evento foi excluído com sucesso",
    });
  };

  // Funções para gerenciar períodos sazonais
  const criarPeriodoSazonal = (periodo: Omit<PeriodoSazonal, 'id'>) => {
    const novoPeriodo: PeriodoSazonal = {
      ...periodo,
      id: `periodo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setPeriodosSazonais(prev => [...prev, novoPeriodo]);
    
    toast({
      title: "Período sazonal criado",
      description: `Período "${periodo.nome}" foi criado com sucesso`,
    });
  };

  const atualizarPeriodoSazonal = (id: string, dadosAtualizados: Partial<PeriodoSazonal>) => {
    setPeriodosSazonais(prev => prev.map(periodo => 
      periodo.id === id ? { ...periodo, ...dadosAtualizados } : periodo
    ));
    
    toast({
      title: "Período sazonal atualizado",
      description: "Período foi atualizado com sucesso",
    });
  };

  const excluirPeriodoSazonal = (id: string) => {
    setPeriodosSazonais(prev => prev.filter(periodo => periodo.id !== id));
    
    toast({
      title: "Período sazonal excluído",
      description: "Período foi excluído com sucesso",
    });
  };

  // Funções para alertas
  const gerarAlertas = (evento: Evento) => {
    const hoje = new Date();
    const dataEvento = new Date(evento.dataInicio);
    const diasParaEvento = Math.ceil((dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diasParaEvento > 0 && diasParaEvento <= 30) {
      const novoAlert: EventoAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventoId: evento.id,
        tipo: 'evento_proximo',
        titulo: `Evento "${evento.nome}" em ${diasParaEvento} dias`,
        descricao: `Prepare-se para o evento com impacto ${evento.impacto} na ocupação`,
        data: new Date().toISOString(),
        prioridade: evento.impacto === 'alto' ? 'alta' : evento.impacto === 'medio' ? 'media' : 'baixa',
        visualizado: false
      };

      setAlerts(prev => [...prev, novoAlert]);
    }
  };

  const marcarAlertaComoVisualizado = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, visualizado: true } : alert
    ));
  };

  // Função para obter eventos de uma propriedade
  const obterEventosPropriedade = (propriedadeId: string, ativo = true) => {
    return eventos.filter(evento => 
      evento.propriedadeId === propriedadeId && (!ativo || evento.ativo)
    );
  };

  // Função para obter períodos sazonais de uma propriedade
  const obterPeriodosSazonaisPropriedade = (propriedadeId: string, ativo = true) => {
    return periodosSazonais.filter(periodo => 
      periodo.propriedadeId === propriedadeId && (!ativo || periodo.ativo)
    );
  };

  // Função para calcular impacto em uma data específica
  const calcularImpactoData = (propriedadeId: string, data: string) => {
    const dataTarget = new Date(data);
    let impactoOcupacao = 1;
    let impactoADR = 1;
    const eventosAtivos: Evento[] = [];
    const periodosAtivos: PeriodoSazonal[] = [];

    // Verificar eventos ativos na data
    eventos.forEach(evento => {
      if (evento.propriedadeId === propriedadeId && evento.ativo) {
        const dataInicio = new Date(evento.dataInicio);
        const dataFim = new Date(evento.dataFim);
        
        if (dataTarget >= dataInicio && dataTarget <= dataFim) {
          impactoOcupacao *= (1 + evento.impactoOcupacao / 100);
          impactoADR *= (1 + evento.impactoADR / 100);
          eventosAtivos.push(evento);
        }
      }
    });

    // Verificar períodos sazonais ativos na data
    periodosSazonais.forEach(periodo => {
      if (periodo.propriedadeId === propriedadeId && periodo.ativo) {
        const mesAtual = dataTarget.getMonth() + 1;
        const diaAtual = dataTarget.getDate();
        
        const [mesInicio, diaInicio] = periodo.dataInicio.split('-').map(Number);
        const [mesFim, diaFim] = periodo.dataFim.split('-').map(Number);
        
        let dentroPerido = false;
        
        if (mesInicio <= mesFim) {
          // Período dentro do mesmo ano
          dentroPerido = (mesAtual > mesInicio || (mesAtual === mesInicio && diaAtual >= diaInicio)) &&
                        (mesAtual < mesFim || (mesAtual === mesFim && diaAtual <= diaFim));
        } else {
          // Período que cruza o ano (ex: Dec-Feb)
          dentroPerido = (mesAtual > mesInicio || (mesAtual === mesInicio && diaAtual >= diaInicio)) ||
                        (mesAtual < mesFim || (mesAtual === mesFim && diaAtual <= diaFim));
        }
        
        if (dentroPerido) {
          impactoOcupacao *= periodo.multiplicadorOcupacao;
          impactoADR *= periodo.multiplicadorADR;
          periodosAtivos.push(periodo);
        }
      }
    });

    return {
      multiplicadorOcupacao: impactoOcupacao,
      multiplicadorADR: impactoADR,
      eventosAtivos,
      periodosAtivos
    };
  };

  // Alertas não visualizados
  const alertsNaoVisualizados = useMemo(() => 
    alerts.filter(alert => !alert.visualizado), [alerts]);

  return {
    // Estados
    eventos,
    periodosSazonais,
    alerts,
    alertsNaoVisualizados,
    
    // Funções para eventos
    criarEvento,
    atualizarEvento,
    excluirEvento,
    obterEventosPropriedade,
    
    // Funções para períodos sazonais
    criarPeriodoSazonal,
    atualizarPeriodoSazonal,
    excluirPeriodoSazonal,
    obterPeriodosSazonaisPropriedade,
    
    // Funções para alertas
    marcarAlertaComoVisualizado,
    
    // Análise de impacto
    calcularImpactoData
  };
}
