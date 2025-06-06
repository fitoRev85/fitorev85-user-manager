
import { useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { AlertaAutomatico } from '@/types/events';
import { parseISO } from 'date-fns';

export function useEventAlerts(propertyId: string) {
  const { alerts, obterEventosPropriedade } = useEvents();
  
  const eventos = useMemo(() => 
    obterEventosPropriedade(propertyId), 
    [obterEventosPropriedade, propertyId]
  );

  const alertsPropriedade = useMemo(() => 
    alerts.filter(alert => {
      const evento = eventos.find(e => e.id === alert.eventoId);
      return evento !== undefined;
    }), 
    [alerts, eventos]
  );

  const alertsNaoLidos = useMemo(() => 
    alertsPropriedade.filter(alert => !alert.visualizado),
    [alertsPropriedade]
  );

  const alertsLidos = useMemo(() => 
    alertsPropriedade.filter(alert => alert.visualizado),
    [alertsPropriedade]
  );

  const alertasAutomaticos = useMemo((): AlertaAutomatico[] => {
    const hoje = new Date();
    const alertas: AlertaAutomatico[] = [];

    eventos.forEach(evento => {
      const dataEvento = parseISO(evento.dataInicio);
      const diasParaEvento = Math.ceil((dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      // Alertas para eventos nos próximos 7 dias
      if (diasParaEvento > 0 && diasParaEvento <= 7) {
        alertas.push({
          id: `auto_${evento.id}_7d`,
          tipo: 'evento_proximo',
          titulo: `Evento "${evento.nome}" em ${diasParaEvento} dias`,
          descricao: 'Revise estratégias de pricing para maximizar o impacto do evento',
          prioridade: evento.impacto === 'alto' ? 'alta' : 'media',
          evento,
          dias: diasParaEvento
        });
      }

      // Alertas para eventos nos próximos 30 dias
      if (diasParaEvento > 7 && diasParaEvento <= 30) {
        alertas.push({
          id: `auto_${evento.id}_30d`,
          tipo: 'oportunidade_pricing',
          titulo: `Oportunidade: ${evento.nome}`,
          descricao: `Evento em ${diasParaEvento} dias. Considere ajustar preços antecipadamente`,
          prioridade: 'media',
          evento,
          dias: diasParaEvento
        });
      }
    });

    return alertas;
  }, [eventos]);

  const estatisticas = useMemo(() => ({
    totalAlertas: alertsPropriedade.length,
    alertasNaoLidos: alertsNaoLidos.length,
    alertasLidos: alertsLidos.length,
    alertasAlta: alertsPropriedade.filter(a => a.prioridade === 'alta').length,
    alertasAutomaticos: alertasAutomaticos.length
  }), [alertsPropriedade, alertsNaoLidos, alertsLidos, alertasAutomaticos]);

  return {
    eventos,
    alertsPropriedade,
    alertsNaoLidos,
    alertsLidos,
    alertasAutomaticos,
    estatisticas
  };
}
