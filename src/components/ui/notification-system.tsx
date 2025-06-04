
import React from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info, TrendingUp } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'forecast';

interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'forecast':
      return <TrendingUp className="w-5 h-5 text-purple-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

export const showNotification = (
  type: NotificationType,
  message: string,
  options: NotificationOptions = {}
) => {
  const { title, description, duration = 4000, action } = options;
  
  const notificationContent = (
    <div className="flex items-start gap-3 p-1">
      {getNotificationIcon(type)}
      <div className="flex-1">
        {title && (
          <div className="font-semibold text-sm mb-1">{title}</div>
        )}
        <div className="text-sm opacity-90">{message}</div>
        {description && (
          <div className="text-xs opacity-70 mt-1">{description}</div>
        )}
      </div>
    </div>
  );

  toast(notificationContent, {
    duration,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    className: `border-l-4 ${
      type === 'success' ? 'border-l-green-500' :
      type === 'error' ? 'border-l-red-500' :
      type === 'warning' ? 'border-l-yellow-500' :
      type === 'forecast' ? 'border-l-purple-500' :
      'border-l-blue-500'
    }`,
  });
};

// Convenience functions
export const notifySuccess = (message: string, options?: NotificationOptions) => 
  showNotification('success', message, options);

export const notifyError = (message: string, options?: NotificationOptions) => 
  showNotification('error', message, options);

export const notifyWarning = (message: string, options?: NotificationOptions) => 
  showNotification('warning', message, options);

export const notifyInfo = (message: string, options?: NotificationOptions) => 
  showNotification('info', message, options);

export const notifyForecast = (message: string, options?: NotificationOptions) => 
  showNotification('forecast', message, options);
