
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings, History, Target } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import NotificationCenter from '@/components/alerts/NotificationCenter';
import ThresholdConfig from '@/components/alerts/ThresholdConfig';
import AlertHistory from '@/components/alerts/AlertHistory';

const AlertsSystem = () => {
  const {
    alerts,
    alertHistory,
    thresholds,
    stats,
    addThreshold,
    updateThreshold,
    deleteThreshold,
    markAsRead,
    dismissAlert,
    clearAllAlerts
  } = useAlerts();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
            {stats.unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {stats.unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <History className="w-4 h-4 mr-2" />
            Histórico
            <span className="ml-2 bg-slate-600 text-slate-300 text-xs rounded-full px-1.5 py-0.5">
              {alertHistory.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter
            alerts={alerts}
            stats={stats}
            onMarkAsRead={markAsRead}
            onDismissAlert={dismissAlert}
            onClearAll={clearAllAlerts}
          />
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <ThresholdConfig
            thresholds={thresholds}
            onAddThreshold={addThreshold}
            onUpdateThreshold={updateThreshold}
            onDeleteThreshold={deleteThreshold}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <AlertHistory alertHistory={alertHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsSystem;
