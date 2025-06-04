
import { useState, useEffect, useMemo } from 'react';
import { useProperties } from './useProperties';
import { useMLForecasting } from './useMLForecasting';

export interface AlertThreshold {
  id: string;
  propertyId: string;
  metric: 'occupancy' | 'adr' | 'revenue' | 'cancellation';
  threshold: number;
  operator: 'above' | 'below';
  enabled: boolean;
  priority: 'low' | 'medium' | 'high';
  name: string;
}

export interface Alert {
  id: string;
  type: 'threshold' | 'predictive' | 'system';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  propertyId: string;
  propertyName: string;
  timestamp: Date;
  isRead: boolean;
  isActive: boolean;
  value?: number;
  threshold?: number;
  prediction?: {
    metric: string;
    currentValue: number;
    predictedValue: number;
    daysAhead: number;
    confidence: number;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  recipients: string[];
}

export function useAlerts() {
  const { properties } = useProperties();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([
    {
      id: '1',
      propertyId: '1',
      metric: 'occupancy',
      threshold: 70,
      operator: 'below',
      enabled: true,
      priority: 'high',
      name: 'Ocupação Baixa'
    },
    {
      id: '2',
      propertyId: '1',
      metric: 'adr',
      threshold: 250,
      operator: 'below',
      enabled: true,
      priority: 'medium',
      name: 'ADR Baixo'
    },
    {
      id: '3',
      propertyId: '1',
      metric: 'revenue',
      threshold: 100000,
      operator: 'below',
      enabled: true,
      priority: 'high',
      name: 'Receita Baixa'
    }
  ]);
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    emailEnabled: true,
    pushEnabled: false,
    frequency: 'immediate',
    recipients: ['revenue@hotel.com', 'manager@hotel.com']
  });

  // Gerar alertas baseados nos thresholds
  const generateThresholdAlerts = () => {
    const newAlerts: Alert[] = [];
    
    properties.forEach(property => {
      const propertyThresholds = thresholds.filter(t => 
        t.propertyId === property.id && t.enabled
      );
      
      propertyThresholds.forEach(threshold => {
        let currentValue = 0;
        let shouldAlert = false;
        
        // Simular valores atuais baseados na propriedade
        switch (threshold.metric) {
          case 'occupancy':
            currentValue = Math.random() * 100;
            break;
          case 'adr':
            currentValue = 150 + Math.random() * 200;
            break;
          case 'revenue':
            currentValue = 50000 + Math.random() * 100000;
            break;
          case 'cancellation':
            currentValue = Math.random() * 15;
            break;
        }
        
        shouldAlert = threshold.operator === 'below' 
          ? currentValue < threshold.threshold
          : currentValue > threshold.threshold;
          
        if (shouldAlert) {
          newAlerts.push({
            id: `alert-${Date.now()}-${Math.random()}`,
            type: 'threshold',
            title: threshold.name,
            message: `${threshold.metric} está ${threshold.operator === 'below' ? 'abaixo' : 'acima'} do limite (${currentValue.toFixed(1)} vs ${threshold.threshold})`,
            severity: threshold.priority,
            propertyId: property.id,
            propertyName: property.name,
            timestamp: new Date(),
            isRead: false,
            isActive: true,
            value: currentValue,
            threshold: threshold.threshold
          });
        }
      });
    });
    
    return newAlerts;
  };

  // Gerar alertas preditivos
  const generatePredictiveAlerts = () => {
    const newAlerts: Alert[] = [];
    
    properties.forEach(property => {
      // Simular previsões
      const predictions = [
        {
          metric: 'Ocupação',
          currentValue: 75,
          predictedValue: 45,
          daysAhead: 7,
          confidence: 0.85
        },
        {
          metric: 'ADR',
          currentValue: 280,
          predictedValue: 200,
          daysAhead: 14,
          confidence: 0.78
        }
      ];
      
      predictions.forEach(prediction => {
        const percentageChange = ((prediction.predictedValue - prediction.currentValue) / prediction.currentValue) * 100;
        
        if (Math.abs(percentageChange) > 15 && prediction.confidence > 0.7) {
          newAlerts.push({
            id: `predictive-${Date.now()}-${Math.random()}`,
            type: 'predictive',
            title: `Tendência ${percentageChange > 0 ? 'de Alta' : 'de Queda'} - ${prediction.metric}`,
            message: `Previsão indica ${Math.abs(percentageChange).toFixed(1)}% ${percentageChange > 0 ? 'aumento' : 'queda'} em ${prediction.daysAhead} dias`,
            severity: Math.abs(percentageChange) > 25 ? 'high' : 'medium',
            propertyId: property.id,
            propertyName: property.name,
            timestamp: new Date(),
            isRead: false,
            isActive: true,
            prediction
          });
        }
      });
    });
    
    return newAlerts;
  };

  // Atualizar alertas periodicamente
  useEffect(() => {
    const updateAlerts = () => {
      const thresholdAlerts = generateThresholdAlerts();
      const predictiveAlerts = generatePredictiveAlerts();
      const allNewAlerts = [...thresholdAlerts, ...predictiveAlerts];
      
      setAlerts(allNewAlerts);
    };
    
    updateAlerts();
    const interval = setInterval(updateAlerts, 60000); // Atualizar a cada minuto
    
    return () => clearInterval(interval);
  }, [thresholds, properties]);

  // Funções de controle
  const addThreshold = (threshold: Omit<AlertThreshold, 'id'>) => {
    const newThreshold: AlertThreshold = {
      ...threshold,
      id: Date.now().toString()
    };
    setThresholds(prev => [...prev, newThreshold]);
  };

  const updateThreshold = (id: string, updates: Partial<AlertThreshold>) => {
    setThresholds(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const deleteThreshold = (id: string) => {
    setThresholds(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => {
      const alertToMove = prev.find(a => a.id === alertId);
      if (alertToMove) {
        setAlertHistory(history => [...history, { ...alertToMove, isActive: false }]);
      }
      return prev.filter(a => a.id !== alertId);
    });
  };

  const clearAllAlerts = () => {
    setAlertHistory(prev => [...prev, ...alerts.map(a => ({ ...a, isActive: false }))]);
    setAlerts([]);
  };

  // Estatísticas
  const stats = useMemo(() => {
    const activeCount = alerts.filter(a => a.isActive).length;
    const unreadCount = alerts.filter(a => !a.isRead).length;
    const highPriorityCount = alerts.filter(a => a.severity === 'high' && a.isActive).length;
    
    return {
      activeCount,
      unreadCount,
      highPriorityCount,
      totalHistory: alertHistory.length
    };
  }, [alerts, alertHistory]);

  return {
    alerts,
    alertHistory,
    thresholds,
    notificationSettings,
    stats,
    addThreshold,
    updateThreshold,
    deleteThreshold,
    markAsRead,
    dismissAlert,
    clearAllAlerts,
    setNotificationSettings
  };
}
