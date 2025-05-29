import { 
  User, InsertUser, 
  Employee, InsertEmployee,
  Permission, InsertPermission, PermissionWithEmployee,
  CalendarPeriod, InsertCalendarPeriod,
  users, employees, permissions, calendarPeriods
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import { IStorage } from "./storage";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PgSession = ConnectPgSimple(session);

/**
 * PostgreSQL database storage implementation
 */
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    try {
      return await db.select().from(employees);
    } catch (error) {
      console.error("Error getting employees:", error);
      return [];
    }
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    try {
      const [employee] = await db.select().from(employees).where(eq(employees.id, id));
      return employee || undefined;
    } catch (error) {
      console.error("Error getting employee:", error);
      return undefined;
    }
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db
      .insert(employees)
      .values(employee)
      .returning();
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    try {
      const [updatedEmployee] = await db
        .update(employees)
        .set(employee)
        .where(eq(employees.id, id))
        .returning();
      return updatedEmployee || undefined;
    } catch (error) {
      console.error("Error updating employee:", error);
      return undefined;
    }
  }

  async deleteEmployee(id: number): Promise<boolean> {
    try {
      const result = await db.delete(employees).where(eq(employees.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting employee:", error);
      return false;
    }
  }

  // Permission methods
  async getPermissions(): Promise<Permission[]> {
    try {
      return await db.select().from(permissions);
    } catch (error) {
      console.error("Error getting permissions:", error);
      return [];
    }
  }

  async getPermissionsByEmployee(employeeId: number): Promise<Permission[]> {
    try {
      return await db.select().from(permissions).where(eq(permissions.employeeId, employeeId));
    } catch (error) {
      console.error("Error getting permissions by employee:", error);
      return [];
    }
  }

  async getPermissionsByMonth(startDate: Date, endDate: Date): Promise<PermissionWithEmployee[]> {
    try {
      const result = await db
        .select({
          id: permissions.id,
          employeeId: permissions.employeeId,
          date: permissions.date,
          type: permissions.type,
          reason: permissions.reason,
          status: permissions.status,
          employee: employees
        })
        .from(permissions)
        .innerJoin(employees, eq(permissions.employeeId, employees.id))
        .where(
          and(
            gte(permissions.date, startDate),
            lte(permissions.date, endDate)
          )
        );

      return result.map(row => ({
        id: row.id,
        employeeId: row.employeeId,
        date: row.date,
        type: row.type,
        reason: row.reason,
        status: row.status,
        employee: row.employee
      }));
    } catch (error) {
      console.error("Error getting permissions by month:", error);
      return [];
    }
  }

  async getPermission(id: number): Promise<Permission | undefined> {
    try {
      const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
      return permission || undefined;
    } catch (error) {
      console.error("Error getting permission:", error);
      return undefined;
    }
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [newPermission] = await db
      .insert(permissions)
      .values(permission)
      .returning();
    return newPermission;
  }

  async updatePermission(id: number, permission: Partial<InsertPermission>): Promise<Permission | undefined> {
    try {
      const [updatedPermission] = await db
        .update(permissions)
        .set(permission)
        .where(eq(permissions.id, id))
        .returning();
      return updatedPermission || undefined;
    } catch (error) {
      console.error("Error updating permission:", error);
      return undefined;
    }
  }

  async deletePermission(id: number): Promise<boolean> {
    try {
      await db.delete(permissions).where(eq(permissions.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting permission:", error);
      return false;
    }
  }

  // Calendar period methods
  async getCalendarPeriods(): Promise<CalendarPeriod[]> {
    try {
      return await db.select().from(calendarPeriods);
    } catch (error) {
      console.error("Error getting calendar periods:", error);
      return [];
    }
  }

  async getCalendarPeriodByMonth(startDate: Date): Promise<CalendarPeriod | undefined> {
    try {
      const [period] = await db
        .select()
        .from(calendarPeriods)
        .where(eq(calendarPeriods.monthStartDate, startDate));
      return period || undefined;
    } catch (error) {
      console.error("Error getting calendar period by month:", error);
      return undefined;
    }
  }

  async createCalendarPeriod(period: InsertCalendarPeriod): Promise<CalendarPeriod> {
    const [newPeriod] = await db
      .insert(calendarPeriods)
      .values(period)
      .returning();
    return newPeriod;
  }

  async updateCalendarPeriod(id: number, period: Partial<InsertCalendarPeriod>): Promise<CalendarPeriod | undefined> {
    try {
      const [updatedPeriod] = await db
        .update(calendarPeriods)
        .set(period)
        .where(eq(calendarPeriods.id, id))
        .returning();
      return updatedPeriod || undefined;
    } catch (error) {
      console.error("Error updating calendar period:", error);
      return undefined;
    }
  }

  // Bulk operations
  async publishCalendarPeriod(periodId: number): Promise<boolean> {
    try {
      await db
        .update(calendarPeriods)
        .set({ status: "published" })
        .where(eq(calendarPeriods.id, periodId));
      return true;
    } catch (error) {
      console.error("Error publishing calendar period:", error);
      return false;
    }
  }

  async publishPermissions(permissionIds: number[]): Promise<boolean> {
    try {
      for (const id of permissionIds) {
        await db
          .update(permissions)
          .set({ status: "published" })
          .where(eq(permissions.id, id));
      }
      return true;
    } catch (error) {
      console.error("Error publishing permissions:", error);
      return false;
    }
  }
}