import { useEffect, useState } from "react";

interface Notification {
  id: number;
  fecha: string;
  texto: string;
  timestamp: Date;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Record<string, Notification[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect to the server-rendered notifications page
    window.location.href = '/notificaciones';
  }, []);

  if (isLoading) {
    return (
      <div className="notification-container">
        <div className="page-title">
          <i className="fa-light fa-bell color-lightblue2"></i>
          Cargando notificaciones...
        </div>
      </div>
    );
  }

  return (
    <div className="notification-container">
      <div className="page-title">
        <i className="fa-light fa-bell color-lightblue2"></i>
        Notificaciones de VictoriaFlow
      </div>

      {Object.keys(notifications).length === 0 ? (
        <div className="notification-card">
          <div className="empty-state">
            <i className="fa-light fa-inbox"></i>
            <div>No hay notificaciones disponibles</div>
          </div>
        </div>
      ) : (
        Object.entries(notifications)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([fecha, notificationList]) => (
            <div key={fecha} className="notification-card">
              <div className="notification-header">
                <div className="notification-date">
                  <i className="fa-light fa-calendar-day"></i> {fecha}
                </div>
                <div className="notification-count">{notificationList.length}</div>
              </div>
              {notificationList.map(notif => (
                <div key={notif.id} className="notification-item">
                  <div className="notification-meta">
                    <div className="notification-id">#{notif.id}</div>
                    <div className="notification-time">
                      <i className="fa-light fa-clock"></i> {new Date(notif.timestamp).toLocaleTimeString('es-ES')}
                    </div>
                  </div>
                  <div className="notification-text">{notif.texto}</div>
                </div>
              ))}
            </div>
          ))
      )}
    </div>
  );
}