import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export interface Notification {
  id: number;
  fecha: string;
  texto: string;
  timestamp: Date;
}

export function useNotifications() {
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      return data.map((notification: any) => ({
        ...notification,
        timestamp: new Date(notification.timestamp)
      }));
    },
  });

  const getNotificationsForDate = (date: Date): Notification[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return notifications.filter(notification => notification.fecha === dateStr);
  };

  return {
    notifications,
    isLoading,
    error,
    refetch,
    getNotificationsForDate
  };
}