import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { checkDatabase } from "./db";
import { 
  insertEmployeeSchema, 
  insertPermissionSchema,
  insertCalendarPeriodSchema
} from "@shared/schema";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// Persistent storage for notifications
interface Notification {
  id: number;
  fecha: string;
  texto: string;
  timestamp: Date;
}

const NOTIFICATIONS_FILE = path.join(process.cwd(), 'notifications.json');

// Create some test notifications on startup
const testNotifications: Notification[] = [
  {
    id: 1,
    fecha: "2024-01-15",
    texto: "Notificación de prueba - Sistema iniciado correctamente",
    timestamp: new Date()
  },
  {
    id: 2,
    fecha: "2024-01-15", 
    texto: "Segunda notificación de prueba para verificar funcionamiento",
    timestamp: new Date()
  }
];

// Load notifications from file
function loadNotifications(): Notification[] {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      return parsed.notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
  return [];
}

// Save notifications to file
function saveNotifications(notifications: Notification[]) {
  try {
    const data = {
      notifications,
      lastId: Math.max(...notifications.map(n => n.id), 0)
    };
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(data, null, 2));
    console.log(`📝 Guardadas ${notifications.length} notificaciones en ${NOTIFICATIONS_FILE}`);
  } catch (error) {
    console.error('❌ Error saving notifications:', error);
    console.error('File path:', NOTIFICATIONS_FILE);
    console.error('Current working directory:', process.cwd());
  }
}

// Initialize notifications storage
let notifications: Notification[] = loadNotifications();

// If no notifications exist, add test data
if (notifications.length === 0) {
  notifications = testNotifications;
  saveNotifications(notifications);
  console.log("✅ Notificaciones de prueba creadas");
}

let notificationIdCounter = Math.max(...notifications.map(n => n.id), 0) + 1;

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);
  
  // Database status endpoint
  app.get("/api/database/status", async (req, res) => {
    const isConnected = await checkDatabase();
    res.json({ 
      connected: isConnected,
      mode: isConnected ? "postgres" : "memory"
    });
  });
  
  // Custom endpoint for receiving POST from another Replit
  app.post("/actualizar", (req: Request, res: Response) => {
    console.log("📨 Recibida petición POST /actualizar:", req.body);
    
    const { fecha, texto, token } = req.body;
    
    // Validate token
    if (token !== "mi-token-seguro") {
      console.log("❌ Token inválido recibido:", token);
      return res.status(401).json({ message: "Token inválido" });
    }
    
    // Store notification persistently
    const notification: Notification = {
      id: notificationIdCounter++,
      fecha,
      texto,
      timestamp: new Date()
    };
    notifications.push(notification);
    
    // Save to file for persistence
    saveNotifications(notifications);
    
    // Print to console
    console.log(`✅ Nueva notificación: ${fecha}: ${texto}`);
    console.log(`📊 Total notificaciones: ${notifications.length}`);
    
    // Return success response
    res.status(200).json({ 
      message: "Actualización recibida correctamente",
      notificationId: notification.id,
      totalNotifications: notifications.length
    });
  });

  // Debug endpoint to check notifications status
  app.get("/api/notifications/debug", (req: Request, res: Response) => {
    res.json({
      totalNotifications: notifications.length,
      notificationsFile: NOTIFICATIONS_FILE,
      fileExists: fs.existsSync(NOTIFICATIONS_FILE),
      currentWorkingDir: process.cwd(),
      notifications: notifications
    });
  });

  // Endpoint to get notifications
  app.get("/notificaciones", (req: Request, res: Response) => {
    // Sort notifications by timestamp (newest first) and group by date
    const sortedNotifications = notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const groupedNotifications = sortedNotifications.reduce((acc, notification) => {
      if (!acc[notification.fecha]) {
        acc[notification.fecha] = [];
      }
      acc[notification.fecha].push({
        texto: notification.texto,
        timestamp: notification.timestamp,
        id: notification.id
      });
      return acc;
    }, {} as Record<string, Array<{texto: string, timestamp: Date, id: number}>>);

    // Generate HTML response using your custom template
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificaciones - VictoriaFlow</title>
        <link rel="stylesheet" href="/static/css/normalize.css">
        <link rel="stylesheet" href="/static/css/styles.css">
        <link rel="stylesheet" href="/static/lib/fontawesome/css/fontawesome.min.css">
        <link rel="stylesheet" href="/static/lib/fontawesome/css/light.min.css">
        <link rel="stylesheet" href="/static/lib/fontawesome/css/solid.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200;400;600;700&display=swap" rel="stylesheet">
        <style>
            .notification-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            .notification-card {
                background: var(--gv-white);
                border: 1px solid var(--gv-gray5);
                border-radius: 8px;
                margin-bottom: 16px;
                overflow: hidden;
            }
            .notification-header {
                background: var(--gv-lightblue6);
                padding: 16px 20px;
                border-bottom: 1px solid var(--gv-gray5);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .notification-date {
                font-weight: 600;
                color: var(--gv-lightblue2);
                font-size: 16px;
            }
            .notification-count {
                background: var(--gv-lightblue2);
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            .notification-item {
                padding: 16px 20px;
                border-bottom: 1px solid var(--gv-gray7);
                position: relative;
            }
            .notification-item:last-child {
                border-bottom: none;
            }
            .notification-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .notification-id {
                font-size: 12px;
                color: var(--gv-gray3);
                font-weight: 600;
            }
            .notification-time {
                font-size: 12px;
                color: var(--gv-gray3);
            }
            .notification-text {
                color: var(--gv-gray1);
                line-height: 1.5;
                font-size: 14px;
            }
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: var(--gv-gray3);
            }
            .empty-state i {
                font-size: 48px;
                margin-bottom: 16px;
                color: var(--gv-gray4);
            }
            .page-title {
                color: var(--gv-gray1);
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
        </style>
    </head>
    <body>
        <div class="portal-header">
            <div class="header-content">
                <img src="https://www.geovictoria.com/hubfs/social-suggested-images/info.geovictoria.comhubfscropped-Logo-WEB-5-1.png" width="112px"/>
                <div class="divider"></div>
                <div class="color-lightblue2">Control de Asistencia</div>
                <div class="divider"></div>
                <input class="gv-input" type="text" placeholder="Buscar..."/>
            </div>
            
            <div class="header-content">
                <div class="info-buttons">
                    <i class="fa-light fa-grid-round color-lightblue2"></i>
                </div>
                
                <div class="info-buttons company">
                    <div>Empresa</div>
                    <img src="https://cdn.countryflags.com/thumbs/chile/flag-round-250.png" height="24px"/>
                </div>

                <div class="info-buttons user">
                    <i class="fa-solid fa-circle-user color-lightblue2"></i>
                </div>
            </div>
        </div>
        
        <div class="portal-body">
            <div class="side-menu">
                <i class="fa-light fa-star"></i>
                <i class="fa-light fa-file-lines"></i>
                <i class="fa-light fa-user"></i>
                <i class="fa-light fa-users"></i>
                <i class="fa-light fa-calendar-lines-pen"></i>
                <i class="fa-light fa-gear-complex"></i>
            </div>
            
            <div class="container-fluid">
                <!-- Breadcrumb Navigation -->
                <div class="breadcrumb">
                    <span class="breadcrumb-item">Sistema</span>
                    <i class="fa-light fa-chevron-right"></i>
                    <span class="breadcrumb-item current">Notificaciones</span>
                </div>

                <div class="notification-container">
                    <div class="page-title">
                        <i class="fa-light fa-bell color-lightblue2"></i>
                        Notificaciones de VictoriaFlow
                    </div>

                    ${Object.keys(groupedNotifications).length === 0 
                        ? `<div class="notification-card">
                             <div class="empty-state">
                               <i class="fa-light fa-inbox"></i>
                               <div>No hay notificaciones disponibles</div>
                             </div>
                           </div>`
                        : Object.entries(groupedNotifications)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([fecha, notificationList]) => `
                                <div class="notification-card">
                                    <div class="notification-header">
                                        <div class="notification-date">
                                            <i class="fa-light fa-calendar-day"></i> ${fecha}
                                        </div>
                                        <div class="notification-count">${notificationList.length}</div>
                                    </div>
                                    ${notificationList.map(notif => `
                                        <div class="notification-item">
                                            <div class="notification-meta">
                                                <div class="notification-id">#${notif.id}</div>
                                                <div class="notification-time">
                                                    <i class="fa-light fa-clock"></i> ${notif.timestamp.toLocaleTimeString('es-ES')}
                                                </div>
                                            </div>
                                            <div class="notification-text">${notif.texto}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            `).join('')
                    }
                </div>
            </div>
        </div>
    </body>
    </html>`;

    res.send(html);
  });
  
  // Add API routes
  
  // Employee routes
  app.get("/api/employees", async (req: Request, res: Response) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/employees/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployee(Number(id));
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/employees", async (req: Request, res: Response) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/employees/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const employeeData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(Number(id), employeeData);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/employees/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEmployee(Number(id));
      
      if (!success) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Permission routes
  app.get("/api/permissions", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, employeeId } = req.query;
      
      if (startDate && endDate) {
        const permissions = await storage.getPermissionsByMonth(
          new Date(startDate as string), 
          new Date(endDate as string)
        );
        return res.json(permissions);
      }
      
      if (employeeId) {
        const permissions = await storage.getPermissionsByEmployee(Number(employeeId));
        return res.json(permissions);
      }
      
      const permissions = await storage.getPermissions();
      res.json(permissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/permissions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const permission = await storage.getPermission(Number(id));
      
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }
      
      res.json(permission);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/permissions", async (req: Request, res: Response) => {
    try {
      console.log("Received permission data:", req.body);
      
      // Ensure date is properly converted to Date object
      const data = {
        ...req.body,
        date: new Date(req.body.date)
      };
      
      const permissionData = insertPermissionSchema.parse(data);
      const permission = await storage.createPermission(permissionData);
      res.status(201).json(permission);
    } catch (error: any) {
      console.error("Error creating permission:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shift data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/shifts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const shiftData = insertShiftSchema.partial().parse(req.body);
      const shift = await storage.updateShift(Number(id), shiftData);
      
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      res.json(shift);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shift data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/shifts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteShift(Number(id));
      
      if (!success) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Schedule routes
  app.get("/api/schedules", async (req: Request, res: Response) => {
    try {
      const { startDate } = req.query;
      
      if (startDate) {
        const schedule = await storage.getScheduleByWeek(new Date(startDate as string));
        return res.json(schedule || null);
      }
      
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/schedules", async (req: Request, res: Response) => {
    try {
      const scheduleData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/schedules/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const scheduleData = insertScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateSchedule(Number(id), scheduleData);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json(schedule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // Bulk operations
  app.post("/api/schedules/:id/publish", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.publishSchedule(Number(id));
      
      if (!success) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/shifts/publish", async (req: Request, res: Response) => {
    try {
      const { shiftIds } = req.body;
      
      if (!Array.isArray(shiftIds)) {
        return res.status(400).json({ message: "Invalid request, shiftIds must be an array" });
      }
      
      const success = await storage.publishShifts(shiftIds);
      
      if (!success) {
        return res.status(404).json({ message: "One or more shifts not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
