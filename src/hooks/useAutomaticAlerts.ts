
import { useMemo } from 'react';
import { useProperties } from './useProperties';
import { useReservationData } from './useReservationData';

export interface AutomaticAlert {
  id: string;
  type: 'occupancy' | 'adr' | 'revenue' | 'reservations';
  title: string;
  message: string;
  priority: 'alta' | 'media' | 'baixa';
  propertyId: string;
  propertyName: string;
  value: number;
  threshold: number;
  timestamp: Date;
  isActive: boolean;
}

export function useAutomaticAlerts() {
  const { properties } = useProperties();
  
  const alerts = useMemo(() => {
    const generatedAlerts: AutomaticAlert[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    properties.forEach(property => {
      // Simular dados de reservas para demonstração
      const reservasMesAtual = Math.floor(Math.random() * 100) + 20;
      const reservasMesAnterior = Math.floor(Math.random() * 100) + 30;
      const ocupacaoAtual = Math.random() * 100;
      const adrAtual = 150 + Math.random() * 200;
      const adrMedioHistorico = 200 + Math.random() * 100;
      const receitaAtual = Math.random() * 80000 + 20000;
      const metaMensal = property.metaMensalReceita || 100000;

      // 1. Alerta de Ocupação Baixa
      if (ocupacaoAtual < 60) {
        generatedAlerts.push({
          id: `occ_${property.id}_${Date.now()}`,
          type: 'occupancy',
          title: 'Ocupação Baixa',
          message: `Ocupação atual de ${ocupacaoAtual.toFixed(1)}% está abaixo do limite de 60%`,
          priority: ocupacaoAtual < 40 ? 'alta' : 'media',
          propertyId: property.id,
          propertyName: property.name,
          value: ocupacaoAtual,
          threshold: 60,
          timestamp: now,
          isActive: true
        });
      }

      // 2. Alerta de ADR Abaixo da Média
      const adrVariacao = ((adrAtual - adrMedioHistorico) / adrMedioHistorico) * 100;
      if (adrVariacao < -15) {
        generatedAlerts.push({
          id: `adr_${property.id}_${Date.now()}`,
          type: 'adr',
          title: 'ADR Abaixo da Média',
          message: `ADR atual R$ ${adrAtual.toFixed(2)} está ${Math.abs(adrVariacao).toFixed(1)}% abaixo da média histórica`,
          priority: adrVariacao < -25 ? 'alta' : 'media',
          propertyId: property.id,
          propertyName: property.name,
          value: adrAtual,
          threshold: adrMedioHistorico * 0.85,
          timestamp: now,
          isActive: true
        });
      }

      // 3. Alerta de Receita Abaixo da Meta
      if (metaMensal > 0 && receitaAtual < metaMensal * 0.8) {
        const percentualMeta = (receitaAtual / metaMensal) * 100;
        generatedAlerts.push({
          id: `rev_${property.id}_${Date.now()}`,
          type: 'revenue',
          title: 'Receita Abaixo da Meta',
          message: `Receita atual R$ ${receitaAtual.toLocaleString()} está ${(100 - percentualMeta).toFixed(1)}% abaixo da meta mensal`,
          priority: percentualMeta < 60 ? 'alta' : 'media',
          propertyId: property.id,
          propertyName: property.name,
          value: receitaAtual,
          threshold: metaMensal,
          timestamp: now,
          isActive: true
        });
      }

      // 4. Alerta de Queda nas Reservas
      const quedaReservas = ((reservasMesAtual - reservasMesAnterior) / reservasMesAnterior) * 100;
      if (quedaReservas < -20) {
        generatedAlerts.push({
          id: `res_${property.id}_${Date.now()}`,
          type: 'reservations',
          title: 'Queda nas Reservas',
          message: `Reservas caíram ${Math.abs(quedaReservas).toFixed(1)}% comparado ao mês anterior (${reservasMesAnterior} → ${reservasMesAtual})`,
          priority: quedaReservas < -35 ? 'alta' : 'media',
          propertyId: property.id,
          propertyName: property.name,
          value: reservasMesAtual,
          threshold: reservasMesAnterior * 0.8,
          timestamp: now,
          isActive: true
        });
      }
    });

    return generatedAlerts.sort((a, b) => {
      const priorityOrder = { alta: 3, media: 2, baixa: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [properties]);

  const alertsAtivos = alerts.filter(alert => alert.isActive);
  const alertsAlta = alertsAtivos.filter(alert => alert.priority === 'alta');
  const alertsMedia = alertsAtivos.filter(alert => alert.priority === 'media');

  const estatisticas = {
    total: alertsAtivos.length,
    alta: alertsAlta.length,
    media: alertsMedia.length,
    baixa: alertsAtivos.filter(alert => alert.priority === 'baixa').length
  };

  return {
    alerts: alertsAtivos,
    alertsAlta,
    alertsMedia,
    estatisticas
  };
}
