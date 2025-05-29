import { MemStorage } from "./storage";
import { DatabaseStorage } from "./database-storage";
import { db } from "./db";
import fs from "fs";
import path from "path";

// Migrate data from memory storage to database
async function migrateData() {
  console.log("🔄 Iniciando migración de datos a PostgreSQL...");
  
  // Create instances
  const memStorage = new MemStorage();
  const dbStorage = new DatabaseStorage();
  
  try {
    // Migrate users
    console.log("📤 Migrando usuarios...");
    const users = await memStorage.getUser(1); // Get admin user
    if (users) {
      await dbStorage.createUser({
        username: users.username,
        password: users.password
      });
      console.log("✅ Usuario admin migrado");
    }
    
    // Migrate employees
    console.log("📤 Migrando empleados...");
    const employees = await memStorage.getEmployees();
    for (const employee of employees) {
      await dbStorage.createEmployee({
        name: employee.name,
        position: employee.position,
        email: employee.email,
        initials: employee.initials,
        active: employee.active
      });
    }
    console.log(`✅ ${employees.length} empleados migrados`);
    
    // Migrate calendar periods
    console.log("📤 Migrando períodos de calendario...");
    const calendarPeriods = await memStorage.getCalendarPeriods();
    for (const period of calendarPeriods) {
      await dbStorage.createCalendarPeriod({
        monthStartDate: period.monthStartDate,
        monthEndDate: period.monthEndDate,
        status: period.status,
        statistics: period.statistics as any
      });
    }
    console.log(`✅ ${calendarPeriods.length} períodos de calendario migrados`);
    
    // Migrate permissions
    console.log("📤 Migrando permisos...");
    const permissions = await memStorage.getPermissions();
    for (const permission of permissions) {
      await dbStorage.createPermission({
        employeeId: permission.employeeId,
        date: permission.date,
        type: permission.type,
        reason: permission.reason,
        status: permission.status
      });
    }
    console.log(`✅ ${permissions.length} permisos migrados`);
    
    // Migrate notifications
    console.log("📤 Migrando notificaciones...");
    const notificationsPath = path.join(process.cwd(), 'notifications.json');
    
    if (fs.existsSync(notificationsPath)) {
      const notificationsData = fs.readFileSync(notificationsPath, 'utf8');
      const notifications = JSON.parse(notificationsData);
      
      // Insert notifications using Drizzle ORM
      const { notifications: notificationsTable } = await import("@shared/schema");
      
      for (const notification of notifications) {
        await db.insert(notificationsTable).values({
          fecha: notification.fecha,
          texto: notification.texto,
          timestamp: new Date(notification.timestamp)
        });
      }
      
      console.log(`✅ ${notifications.length} notificaciones migradas`);
    } else {
      console.log("ℹ️ No se encontraron notificaciones para migrar");
    }
    
    console.log("🎉 Migración completada exitosamente");
    
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData()
    .then(() => {
      console.log("✅ Migración finalizada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error en la migración:", error);
      process.exit(1);
    });
}

export { migrateData };