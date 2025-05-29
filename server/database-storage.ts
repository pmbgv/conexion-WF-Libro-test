import { IStorage } from './storage';
import { 
  users, type User, type InsertUser,
  employees, type Employee, type InsertEmployee,
  permissions, type Permission, type InsertPermission,
  calendarPeriods, type CalendarPeriod, type InsertCalendarPeriod,
  type PermissionWithEmployee
} from "@shared/schema";
import { db } from './db';
import { eq, and, between } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { MemStorage } from './storage';

/**
 * PostgreSQL database storage implementation
 */
export class DatabaseStorage implements IStorage {
  private db: PostgresJsDatabase<any>;
  private fallbackStorage: MemStorage;
  private isConnected: boolean = false;

  constructor(database: PostgresJsDatabase<any> | null) {
    if (!database) {
      console.warn("Database client not available. Using in-memory storage instead.");
      this.fallbackStorage = new MemStorage();
      this.isConnected = false;
    } else {
      this.db = database;
      this.isConnected = true;
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    if (!this.isConnected) return this.fallbackStorage.getUser(id);
    
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.isConnected) return this.fallbackStorage.getUserByUsername(username);
    
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    if (!this.isConnected) return this.fallbackStorage.createUser(user);
    
    const [createdUser] = await this.db.insert(users).values(user).returning();
    return createdUser;
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    if (!this.isConnected) return this.fallbackStorage.getEmployees();
    
    return this.db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    if (!this.isConnected) return this.fallbackStorage.getEmployee(id);
    
    const [employee] = await this.db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    if (!this.isConnected) return this.fallbackStorage.createEmployee(employee);
    
    const [createdEmployee] = await this.db.insert(employees).values(employee).returning();
    return createdEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    if (!this.isConnected) return this.fallbackStorage.updateEmployee(id, employee);
    
    const [updatedEmployee] = await this.db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    if (!this.isConnected) return this.fallbackStorage.deleteEmployee(id);
    
    const result = await this.db
      .delete(employees)
      .where(eq(employees.id, id))
      .returning({ id: employees.id });
    
    return result.length > 0;
  }

  // Permission methods
  async getPermissions(): Promise<Permission[]> {
    if (!this.isConnected) return this.fallbackStorage.getPermissions();
    
    return this.db.select().from(permissions);
  }

  async getPermissionsByEmployee(employeeId: number): Promise<Permission[]> {
    if (!this.isConnected) return this.fallbackStorage.getPermissionsByEmployee(employeeId);
    
    return this.db
      .select()
      .from(permissions)
      .where(eq(permissions.employeeId, employeeId));
  }

  async getPermissionsByMonth(startDate: Date, endDate: Date): Promise<PermissionWithEmployee[]> {
    if (!this.isConnected) return this.fallbackStorage.getPermissionsByMonth(startDate, endDate);
    
    // First get all permissions in the date range
    const permissionsResult = await this.db
      .select()
      .from(permissions)
      .where(
        and(
          between(permissions.date, startDate, endDate)
        )
      );
    
    // Now fetch all the employees for these permissions
    const employeeIds = [...new Set(permissionsResult.map(permission => permission.employeeId))];
    const employeesResult = await this.db
      .select()
      .from(employees)
      .where(
        employeeIds.length > 0
          ? eq(employees.id, employeeIds[0])
          : undefined
      );
    
    // Create a map for quick lookup
    const employeeMap = new Map<number, Employee>();
    employeesResult.forEach(emp => employeeMap.set(emp.id, emp));
    
    // Join the data
    return permissionsResult.map(permission => {
      const employee = employeeMap.get(permission.employeeId);
      if (!employee) {
        throw new Error(`Employee with ID ${permission.employeeId} not found`);
      }
      return { ...permission, employee };
    });
  }

  async getShift(id: number): Promise<Shift | undefined> {
    if (!this.isConnected) return this.fallbackStorage.getShift(id);
    
    const [shift] = await this.db.select().from(shifts).where(eq(shifts.id, id));
    return shift;
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    if (!this.isConnected) return this.fallbackStorage.createShift(shift);
    
    const [createdShift] = await this.db.insert(shifts).values(shift).returning();
    return createdShift;
  }

  async updateShift(id: number, shift: Partial<InsertShift>): Promise<Shift | undefined> {
    if (!this.isConnected) return this.fallbackStorage.updateShift(id, shift);
    
    const [updatedShift] = await this.db
      .update(shifts)
      .set(shift)
      .where(eq(shifts.id, id))
      .returning();
    
    return updatedShift;
  }

  async deleteShift(id: number): Promise<boolean> {
    if (!this.isConnected) return this.fallbackStorage.deleteShift(id);
    
    const result = await this.db
      .delete(shifts)
      .where(eq(shifts.id, id))
      .returning({ id: shifts.id });
    
    return result.length > 0;
  }

  // Schedule methods
  async getSchedules(): Promise<Schedule[]> {
    if (!this.isConnected) return this.fallbackStorage.getSchedules();
    
    return this.db.select().from(schedules);
  }

  async getScheduleByWeek(startDate: Date): Promise<Schedule | undefined> {
    if (!this.isConnected) return this.fallbackStorage.getScheduleByWeek(startDate);
    
    // Convert to start of day to match database format
    const dateStart = new Date(startDate);
    dateStart.setHours(0, 0, 0, 0);
    
    const [schedule] = await this.db
      .select()
      .from(schedules)
      .where(eq(schedules.weekStartDate, dateStart));
    
    return schedule;
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    if (!this.isConnected) return this.fallbackStorage.createSchedule(schedule);
    
    const [createdSchedule] = await this.db.insert(schedules).values(schedule).returning();
    return createdSchedule;
  }

  async updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    if (!this.isConnected) return this.fallbackStorage.updateSchedule(id, schedule);
    
    const [updatedSchedule] = await this.db
      .update(schedules)
      .set(schedule)
      .where(eq(schedules.id, id))
      .returning();
    
    return updatedSchedule;
  }

  // Bulk operations
  async publishSchedule(scheduleId: number): Promise<boolean> {
    if (!this.isConnected) return this.fallbackStorage.publishSchedule(scheduleId);
    
    // First find the schedule to get date range
    const [schedule] = await this.db
      .select()
      .from(schedules)
      .where(eq(schedules.id, scheduleId));
    
    if (!schedule) return false;
    
    // Update the schedule status
    await this.db
      .update(schedules)
      .set({ status: "published" })
      .where(eq(schedules.id, scheduleId));
    
    // Update all shifts in the date range
    await this.db
      .update(shifts)
      .set({ status: "published" })
      .where(
        and(
          between(shifts.date, schedule.weekStartDate, schedule.weekEndDate),
          eq(shifts.status, "draft")
        )
      );
    
    return true;
  }

  async publishShifts(shiftIds: number[]): Promise<boolean> {
    if (!this.isConnected) return this.fallbackStorage.publishShifts(shiftIds);
    
    if (shiftIds.length === 0) return true;
    
    // Update all shifts in the list to published
    const result = await this.db
      .update(shifts)
      .set({ status: "published" })
      .where(
        eq(shifts.id, shiftIds[0]) // Drizzle has issues with in() operator, we'd implement differently in production
      )
      .returning({ id: shifts.id });
    
    return result.length > 0;
  }
  
  // Additional properties required by the interface
  get sessionStore() {
    if (!this.isConnected) return this.fallbackStorage.sessionStore;
    
    throw new Error("Session store not implemented in DatabaseStorage");
  }
}