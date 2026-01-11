import { useEffect, useRef } from 'react';
import { pushNotificationService } from '../services/push-notification.service';

/**
 * Hook para gerenciar push notifications
 */
export function usePushNotifications(userId?: string, authToken?: string) {
  const registeredRef = useRef(false);

  useEffect(() => {
    // Registrar apenas uma vez quando userId e authToken estiverem disponíveis
    if (userId && authToken && !registeredRef.current) {
      pushNotificationService
        .registerForPushNotifications(userId, authToken)
        .then((token) => {
          if (token) {
            console.log('✅ Push notifications registradas');
            registeredRef.current = true;
          }
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar push notifications:', error);
        });
    }
  }, [userId, authToken]);

  return {
    scheduleLocalNotification: pushNotificationService.scheduleLocalNotification.bind(
      pushNotificationService
    ),
    cancelAllNotifications: pushNotificationService.cancelAllNotifications.bind(
      pushNotificationService
    ),
    getBadgeCount: pushNotificationService.getBadgeCount.bind(pushNotificationService),
    clearBadge: pushNotificationService.clearBadge.bind(pushNotificationService),
  };
}

