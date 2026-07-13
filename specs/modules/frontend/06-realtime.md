# Real-Time Notifications

Notificaciones en tiempo real con SignalR.

---

## Architecture
- **SignalR Hub**: `/hubs/notifications` (JWT auth required)
- **Groups**: per-user (`user-{userId}`)
- **Transport**: WebSocket (con fallback a SSE/long-polling)

## Events

| Evento | Descripción |
|--------|-------------|
| `notification:new` | Toast + bell badge increment |
| `comment:reply` | Notificar autor del comentario |
| `course:published` | Notificar estudiantes inscritos |
| `certificate:ready` | Notificar cuando el PDF está listo |

## Frontend Integration

### Hook: `useNotifications()`

El hook maneja toda la lógica de conexión SignalR y estado de notificaciones:

```typescript
// features/notifications/hooks/useNotifications.ts
'use client';

import * as signalR from "@microsoft/signalr";
import { useEffect, useState } from "react";

export function useNotifications() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Conectar al hub cuando el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    conn.on('notification:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      // Mostrar toast
    });

    conn.start()
      .then(() => setConnection(conn))
      .catch(err => console.error('SignalR connection failed:', err));

    return () => {
      conn.stop();
    };
  }, []);

  const markAsRead = async (id: string) => {
    await markNotificationRead(id);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await markAllNotificationsRead();
    setUnreadCount(0);
  };

  return {
    connection,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
```

### Components

```
features/notifications/components/
├── NotificationBell.tsx         → Icono de campana + badge de no-leídos
├── NotificationBell.module.css
├── NotificationPanel.tsx        → Panel desplegable con lista
└── NotificationPanel.module.css
```

### SignalR Client Library

Agregar dependencia:

```json
{
  "dependencies": {
    "@microsoft/signalr": "^8.0.0"
  }
}
```

### Connection Lifecycle
- **Login**: conectar al hub
- **Logout**: desconectar
- **Reconnect**: automático (built-in en SignalR JS client)
- **Error**: mostrar estado de "desconectado" si es necesario

### Unread Count
- Se obtiene inicialmente vía API REST: `GET /notifications/unread-count`
- Se actualiza en tiempo real con evento `notification:new`
- Se decrementa al hacer click en notificación o "marcar todas como leídas"
