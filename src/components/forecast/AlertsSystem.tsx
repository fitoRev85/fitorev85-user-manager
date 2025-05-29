
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, AlertTriangle, CheckCircle, Settings, Plus, X } from 'lucide-react';

const AlertsSystem = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'occupancy_low',
      title: 'Ocupação Baixa',
      message: 'Ocupação prevista para próxima semana está 15% abaixo da meta',
      severity: 'high',
      timestamp: '2024-01-07 09:30',
      isRead: false,
      isActive: true
    },
    {
      id: 2,
      type: 'revenue_high',
      title: 'Meta de Receita Superada',
      message: 'RevPAR do mês atual já superou a meta em 8%',
      severity: 'low',
      timestamp: '2024-01-07 08:15',
      isRead: true,
      isActive: true
    },
    {
      id: 3,
      type: 'cancellation_high',
      title: 'Alta Taxa de Cancelamento',
      message: 'Taxa de cancelamento subiu para 12% nas últimas 24h',
      severity: 'medium',
      timestamp: '2024-01-06 16:45',
      isRead: false,
      isActive: true
    }
  ]);

  const [alertRules, setAlertRules] = useState([
    {
      id: 1,
      name: 'Ocupação Baixa',
      type: 'occupancy_low',
      threshold: 70,
      operator: 'below',
      enabled: true,
      emailEnabled: true,
      dashboardEnabled: true
    },
    {
      id: 2,
      name: 'RevPAR Alto',
      type: 'revpar_high',
      threshold: 250,
      operator: 'above',
      enabled: true,
      emailEnabled: false,
      dashboardEnabled: true
    },
    {
      id: 3,
      name: 'Cancelamentos Altos',
      type: 'cancellation_high',
      threshold: 10,
      operator: 'above',
      enabled: true,
      emailEnabled: true,
      dashboardEnabled: true
    }
  ]);

  const [emailSettings, setEmailSettings] = useState({
    enabled: true,
    recipients: ['revenue@hotel.com', 'manager@hotel.com'],
    frequency: 'immediate'
  });

  const [newRule, setNewRule] = useState({
    name: '',
    type: 'occupancy_low',
    threshold: '',
    operator: 'below'
  });

  const [showAddRule, setShowAddRule] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-500/30 bg-red-500/20';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/20';
      case 'low': return 'border-green-500/30 bg-green-500/20';
      default: return 'border-slate-500/30 bg-slate-500/20';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const markAsRead = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const deleteAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const toggleAlertRule = (ruleId) => {
    setAlertRules(alertRules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const addNewRule = () => {
    if (newRule.name && newRule.threshold) {
      const rule = {
        id: Date.now(),
        ...newRule,
        threshold: parseFloat(newRule.threshold),
        enabled: true,
        emailEnabled: true,
        dashboardEnabled: true
      };
      setAlertRules([...alertRules, rule]);
      setNewRule({ name: '', type: 'occupancy_low', threshold: '', operator: 'below' });
      setShowAddRule(false);
    }
  };

  const addEmailRecipient = (email) => {
    if (email && !emailSettings.recipients.includes(email)) {
      setEmailSettings({
        ...emailSettings,
        recipients: [...emailSettings.recipients, email]
      });
    }
  };

  const removeEmailRecipient = (email) => {
    setEmailSettings({
      ...emailSettings,
      recipients: emailSettings.recipients.filter(r => r !== email)
    });
  };

  return (
    <div className="space-y-6">
      {/* Alertas Ativos */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Alertas Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.filter(alert => alert.isActive).map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${!alert.isRead ? 'ring-1 ring-blue-500/30' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <h4 className="font-medium text-white">{alert.title}</h4>
                      <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                      <span className="text-xs text-slate-400">{alert.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!alert.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(alert.id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Marcar como lido
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Regras */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-400" />
              Regras de Alerta
            </div>
            <Button
              onClick={() => setShowAddRule(!showAddRule)}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showAddRule && (
            <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <h4 className="text-white font-medium mb-3">Adicionar Nova Regra</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Nome da regra"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white rounded-lg px-3 py-2"
                >
                  <option value="occupancy_low">Ocupação Baixa</option>
                  <option value="occupancy_high">Ocupação Alta</option>
                  <option value="revpar_low">RevPAR Baixo</option>
                  <option value="revpar_high">RevPAR Alto</option>
                  <option value="cancellation_high">Cancelamentos Altos</option>
                </select>
                <select
                  value={newRule.operator}
                  onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white rounded-lg px-3 py-2"
                >
                  <option value="below">Abaixo de</option>
                  <option value="above">Acima de</option>
                </select>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Valor"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({ ...newRule, threshold: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Button onClick={addNewRule} className="bg-green-600 hover:bg-green-700">
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {alertRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                <div>
                  <h4 className="font-medium text-white">{rule.name}</h4>
                  <p className="text-sm text-slate-300">
                    {rule.operator === 'above' ? 'Acima de' : 'Abaixo de'} {rule.threshold}%
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <Switch
                      checked={rule.emailEnabled}
                      onCheckedChange={(checked) => {
                        setAlertRules(alertRules.map(r =>
                          r.id === rule.id ? { ...r, emailEnabled: checked } : r
                        ));
                      }}
                    />
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleAlertRule(rule.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Email */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-400" />
            Configurações de Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Envio de emails habilitado</span>
              <Switch
                checked={emailSettings.enabled}
                onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enabled: checked })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Frequência de envio</label>
              <select
                value={emailSettings.frequency}
                onChange={(e) => setEmailSettings({ ...emailSettings, frequency: e.target.value })}
                className="w-full bg-slate-700/50 border-slate-600/50 text-white rounded-lg px-3 py-2"
              >
                <option value="immediate">Imediato</option>
                <option value="hourly">A cada hora</option>
                <option value="daily">Diário</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Destinatários</label>
              <div className="space-y-2">
                {emailSettings.recipients.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-slate-600/50">
                    <span className="text-white">{email}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEmailRecipient(email)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Adicionar email"
                    className="bg-slate-800 border-slate-600 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addEmailRecipient(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      addEmailRecipient(input.value);
                      input.value = '';
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsSystem;
