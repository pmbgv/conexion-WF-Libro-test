import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { checkDatabase } from "./db";
import { 
  insertEmployeeSchema, 
  insertShiftSchema,
  insertScheduleSchema
} from "@shared/schema";
import { z } from "zod";

// In-memory storage for notifications
interface Notification {
  id: number;
  fecha: string;
  texto: string;
  timestamp: Date;
}

let notifications: Notification[] = [];
let notificationIdCounter = 1;

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
    const { fecha, texto, token } = req.body;
    
    // Validate token
    if (token !== "mi-token-seguro") {
      return res.status(401).json({ message: "Token inválido" });
    }
    
    // Store notification in memory
    const notification: Notification = {
      id: notificationIdCounter++,
      fecha,
      texto,
      timestamp: new Date()
    };
    notifications.push(notification);
    
    // Print to console
    console.log(`${fecha}: ${texto}`);
    
    // Return success response
    res.status(200).json({ message: "Actualización recibida correctamente" });
  });

  // Endpoint to get notifications
  app.get("/notificaciones", (req: Request, res: Response) => {
    // Group notifications by date
    const groupedNotifications = notifications.reduce((acc, notification) => {
      if (!acc[notification.fecha]) {
        acc[notification.fecha] = [];
      }
      acc[notification.fecha].push(notification.texto);
      return acc;
    }, {} as Record<string, string[]>);

    // Generate HTML response
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificaciones de VictoriaFlow</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                background-color: #f5f7fa;
                color: #333;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { 
                color: #1976D2; 
                border-bottom: 2px solid #1976D2;
                padding-bottom: 10px;
            }
            .date-group {
                margin-bottom: 25px;
                border-left: 4px solid #4CAF50;
                padding-left: 15px;
            }
            .date-header {
                font-size: 18px;
                font-weight: bold;
                color: #1976D2;
                margin-bottom: 10px;
            }
            .notification {
                background: #f8f9fa;
                padding: 12px;
                margin: 8px 0;
                border-radius: 4px;
                border-left: 3px solid #4CAF50;
            }
            .no-notifications {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 40px;
            }
            .count {
                background: #1976D2;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                margin-left: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📢 Notificaciones de VictoriaFlow</h1>
            ${Object.keys(groupedNotifications).length === 0 
                ? '<div class="no-notifications">No hay notificaciones aún</div>'
                : Object.entries(groupedNotifications)
                    .sort(([a], [b]) => b.localeCompare(a)) // Sort dates descending
                    .map(([fecha, textos]) => `
                        <div class="date-group">
                            <div class="date-header">
                                📅 ${fecha} 
                                <span class="count">${textos.length}</span>
                            </div>
                            ${textos.map(texto => `
                                <div class="notification">${texto}</div>
                            `).join('')}
                        </div>
                    `).join('')
            }
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
  
  // Shift routes
  app.get("/api/shifts", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, employeeId } = req.query;
      
      if (startDate && endDate) {
        const shifts = await storage.getShiftsByWeek(
          new Date(startDate as string), 
          new Date(endDate as string)
        );
        return res.json(shifts);
      }
      
      if (employeeId) {
        const shifts = await storage.getShiftsByEmployee(Number(employeeId));
        return res.json(shifts);
      }
      
      const shifts = await storage.getShifts();
      res.json(shifts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/shifts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const shift = await storage.getShift(Number(id));
      
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      res.json(shift);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/shifts", async (req: Request, res: Response) => {
    try {
      console.log("Received shift data:", req.body);
      
      // Ensure date is properly converted to Date object
      const data = {
        ...req.body,
        date: new Date(req.body.date)
      };
      
      const shiftData = insertShiftSchema.parse(data);
      const shift = await storage.createShift(shiftData);
      res.status(201).json(shift);
    } catch (error: any) {
      console.error("Error creating shift:", error);
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
