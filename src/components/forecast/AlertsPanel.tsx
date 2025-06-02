
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Target, Bell, Edit } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';

interface Alert {
  id: string;
  type: 'adr' | 'occupancy' | 'revenue' | 'forecast';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  currentValue: number;
  targetValue: number;
  suggestedAction: string;
  propertyId: string;
}

interface AlertsPanelProps {
  propertyId: string;
  currentMetrics: {
    adr: number;
    occupancy: number;
    revenue: number;
    forecast: number;
  };
}

const AlertsPanel = ({ propertyId, currentMetrics }: AlertsPanelProps) => {
  const { properties, updateProperty } = useProperties();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [newValues, setNewValues] = useState<{ [key: string]: number }>({});

  // Gerar alertas baseados nas métricas
  React.useEffect(() => {
    const generatedAlerts: Alert[] = [];
    
    // Alert para ADR baixo
    if (currentMetrics.adr < 250) {
      generatedAlerts.push({
        id: 'adr-low',
        type: 'adr',
        title: 'ADR Baixo',
        message: `ADR atual (R$ ${currentMetrics.adr.toFixed(2)}) está abaixo do recomendado`,
        severity: 'medium',
        currentValue: currentMetrics.adr,
        targetValue: 300,
        suggestedAction: 'Aumentar preço base em 15-20%',
        propertyId
      });
    }

    // Alert para ocupação baixa
    if (currentMetrics.occupancy < 70) {
      generatedAlerts.push({
        id: 'occupancy-low',
        type: 'occupancy',
        title: 'Ocupação Baixa',
        message: `Ocupação atual (${currentMetrics.occupancy.toFixed(1)}%) está abaixo do ideal`,
        severity: 'high',
        currentValue: currentMetrics.occupancy,
        targetValue: 80,
        suggestedAction: 'Reduzir preços ou intensificar marketing',
        propertyId
      });
    }

    // Alert para receita
    if (currentMetrics.revenue < 100000) {
      generatedAlerts.push({
        id: 'revenue-low',
        type: 'revenue',
        title: 'Receita Abaixo da Meta',
        message: `Receita atual (R$ ${currentMetrics.revenue.toLocaleString()}) precisa de atenção`,
        severity: 'medium',
        currentValue: currentMetrics.revenue,
        targetValue: 150000,
        suggestedAction: 'Revisar estratégia de pricing e canais de distribuição',
        propertyId
      });
    }

    setAlerts(generatedAlerts);
  }, [currentMetrics, propertyId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingDown className="w-4 h-4" />;
      case 'low': return <TrendingUp className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const handleEditValue = (alertId: string, field: string, value: number) => {
    setNewValues(prev => ({
      ...prev,
      [`${alertId}_${field}`]: value
    }));
  };

  const applyChanges = (alert: Alert) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    // Aplicar mudanças baseadas no tipo de alerta
    const updatedProperty = { ...property };
    
    if (alert.type === 'adr') {
      const newAdr = newValues[`${alert.id}_adr`] || alert.targetValue;
      updatedProperty.adr = newAdr;
    } else if (alert.type === 'occupancy') {
      const newOccupancy = newValues[`${alert.id}_occupancy`] || alert.targetValue;
      updatedProperty.occupancy = newOccupancy;
    }

    updateProperty(updatedProperty);
    setEditingAlert(null);
    
    // Remover o alerta após aplicar mudanças
    setAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          Alertas e Recomendações
          {alerts.length > 0 && (
            <Badge className="bg-red-500/20 text-red-400">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <Target className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-medium">Todas as métricas estão dentro do esperado!</p>
            <p className="text-slate-400 text-sm">Nenhum alerta ativo no momento</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(alert.severity)}
                  <h4 className="text-white font-medium">{alert.title}</h4>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingAlert(editingAlert === alert.id ? null : alert.id)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-slate-300 text-sm mb-3">{alert.message}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-slate-800/50 p-2 rounded">
                  <p className="text-xs text-slate-400">Valor Atual</p>
                  <p className="text-white font-medium">
                    {alert.type === 'revenue' ? `R$ ${alert.currentValue.toLocaleString()}` :
                     alert.type === 'adr' ? `R$ ${alert.currentValue.toFixed(2)}` :
                     `${alert.currentValue.toFixed(1)}%`}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded">
                  <p className="text-xs text-slate-400">Meta Sugerida</p>
                  <p className="text-green-400 font-medium">
                    {alert.type === 'revenue' ? `R$ ${alert.targetValue.toLocaleString()}` :
                     alert.type === 'adr' ? `R$ ${alert.targetValue.toFixed(2)}` :
                     `${alert.targetValue.toFixed(1)}%`}
                  </p>
                </div>
              </div>

              {editingAlert === alert.id && (
                <div className="bg-slate-800/50 p-3 rounded border border-slate-600/50 mb-3">
                  <Label className="text-slate-300 text-sm">Novo Valor</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder={alert.targetValue.toString()}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      onChange={(e) => handleEditValue(alert.id, alert.type, parseFloat(e.target.value))}
                    />
                    <Button
                      size="sm"
                      onClick={() => applyChanges(alert)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-500/10 p-2 rounded border-l-4 border-blue-500">
                <p className="text-blue-400 text-sm font-medium">Ação Recomendada:</p>
                <p className="text-slate-300 text-sm">{alert.suggestedAction}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
