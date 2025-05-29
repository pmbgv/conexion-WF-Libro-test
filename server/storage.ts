import { 
  users, type User, type InsertUser,
  employees, type Employee, type InsertEmployee,
  permissions, type Permission, type InsertPermission,
  calendarPeriods, type CalendarPeriod, type InsertCalendarPeriod,
  type PermissionWithEmployee
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from './db';
import { DatabaseStorage } from './database-storage';

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Permission methods
  getPermissions(): Promise<Permission[]>;
  getPermissionsByEmployee(employeeId: number): Promise<Permission[]>;
  getPermissionsByMonth(startDate: Date, endDate: Date): Promise<PermissionWithEmployee[]>;
  getPermission(id: number): Promise<Permission | undefined>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  updatePermission(id: number, permission: Partial<InsertPermission>): Promise<Permission | undefined>;
  deletePermission(id: number): Promise<boolean>;
  
  // Calendar period methods
  getCalendarPeriods(): Promise<CalendarPeriod[]>;
  getCalendarPeriodByMonth(startDate: Date): Promise<CalendarPeriod | undefined>;
  createCalendarPeriod(period: InsertCalendarPeriod): Promise<CalendarPeriod>;
  updateCalendarPeriod(id: number, period: Partial<InsertCalendarPeriod>): Promise<CalendarPeriod | undefined>;
  
  // Bulk operations
  publishCalendarPeriod(periodId: number): Promise<boolean>;
  publishPermissions(permissionIds: number[]): Promise<boolean>;
  
  // Session store for auth
  sessionStore: session.Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private employees: Map<number, Employee>;
  private permissions: Map<number, Permission>;
  private calendarPeriods: Map<number, CalendarPeriod>;
  
  private currentUserId: number;
  private currentEmployeeId: number;
  private currentPermissionId: number;
  private currentCalendarPeriodId: number;
  
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.employees = new Map();
    this.permissions = new Map();
    this.calendarPeriods = new Map();
    
    this.currentUserId = 1;
    this.currentEmployeeId = 1;
    this.currentPermissionId = 1;
    this.currentCalendarPeriodId = 1;
    
    // Create memory store for sessions
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with seed data
    this.seedData();
  }

  // Initialize with sample data for development
  private seedData() {
    // Create initial admin user
    this.createUser({
      username: "admin", 
      password: "admin123" // In a real app, this would be hashed
    });
    
    // Create sample employees
    const employees = [
      { name: "John Doe", position: "Front Desk", email: "john@example.com", initials: "JD", active: true },
      { name: "Jane Smith", position: "Inventory", email: "jane@example.com", initials: "JS", active: true },
      { name: "Robert Williams", position: "Weekend Support", email: "robert@example.com", initials: "RW", active: true },
      { name: "Lucy Chen", position: "Reception", email: "lucy@example.com", initials: "LC", active: true },
      { name: "Michael Johnson", position: "Maintenance", email: "michael@example.com", initials: "MJ", active: true }
    ];
    
    employees.forEach(emp => {
      this.createEmployee(emp);
    });
    
    // Create current month calendar period
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    this.createCalendarPeriod({
      monthStartDate: startOfMonth,
      monthEndDate: endOfMonth,
      status: "draft",
      statistics: { 
        totalHours: 178,
        avgPerEmployee: 35.6,
        weekdayHours: 162,
        weekendHours: 16,
        coverage: {
          morning: 80,
          afternoon: 95,
          evening: 20
        },
        shifts: {
          draft: 7,
          published: 12
        },
        openPositions: 3
      }
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }
  
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }
  
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const newEmployee: Employee = { ...employee, id };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }
  
  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existingEmployee = this.employees.get(id);
    if (!existingEmployee) return undefined;
    
    const updatedEmployee = { ...existingEmployee, ...employee };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }
  
  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }
  
  // Permission methods
  async getPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }
  
  async getPermissionsByEmployee(employeeId: number): Promise<Permission[]> {
    return Array.from(this.permissions.values()).filter(
      (permission) => permission.employeeId === employeeId
    );
  }
  
  async getPermissionsByMonth(startDate: Date, endDate: Date): Promise<PermissionWithEmployee[]> {
    const permissions = Array.from(this.permissions.values()).filter(permission => {
      const permissionDate = new Date(permission.date);
      return permissionDate >= startDate && permissionDate <= endDate;
    });
    
    return permissions.map(permission => {
      const employee = this.employees.get(permission.employeeId);
      if (!employee) {
        throw new Error(`Employee with ID ${permission.employeeId} not found`);
      }
      return { ...permission, employee };
    });
  }
  
  async getPermission(id: number): Promise<Permission | undefined> {
    return this.permissions.get(id);
  }
  
  async createPermission(permission: InsertPermission): Promise<Permission> {
    const id = this.currentPermissionId++;
    const newPermission: Permission = { ...permission, id };
    this.permissions.set(id, newPermission);
    return newPermission;
  }
  
  async updatePermission(id: number, permission: Partial<InsertPermission>): Promise<Permission | undefined> {
    const existingPermission = this.permissions.get(id);
    if (!existingPermission) return undefined;
    
    const updatedPermission = { ...existingPermission, ...permission };
    this.permissions.set(id, updatedPermission);
    return updatedPermission;
  }
  
  async deletePermission(id: number): Promise<boolean> {
    return this.permissions.delete(id);
  }
  
  // Calendar period methods
  async getCalendarPeriods(): Promise<CalendarPeriod[]> {
    return Array.from(this.calendarPeriods.values());
  }
  
  async getCalendarPeriodByMonth(startDate: Date): Promise<CalendarPeriod | undefined> {
    return Array.from(this.calendarPeriods.values()).find(
      (period) => new Date(period.monthStartDate).toDateString() === startDate.toDateString()
    );
  }
  
  async createCalendarPeriod(period: InsertCalendarPeriod): Promise<CalendarPeriod> {
    const id = this.currentCalendarPeriodId++;
    const newPeriod: CalendarPeriod = { ...period, id };
    this.calendarPeriods.set(id, newPeriod);
    return newPeriod;
  }
  
  async updateCalendarPeriod(id: number, period: Partial<InsertCalendarPeriod>): Promise<CalendarPeriod | undefined> {
    const existingPeriod = this.calendarPeriods.get(id);
    if (!existingPeriod) return undefined;
    
    const updatedPeriod = { ...existingPeriod, ...period };
    this.calendarPeriods.set(id, updatedPeriod);
    return updatedPeriod;
  }
  
  // Bulk operations
  async publishCalendarPeriod(periodId: number): Promise<boolean> {
    const period = this.calendarPeriods.get(periodId);
    if (!period) return false;
    
    // Update period status
    this.calendarPeriods.set(periodId, { ...period, status: "published" });
    
    // Update all related permissions to published
    const startDate = new Date(period.monthStartDate);
    const endDate = new Date(period.monthEndDate);
    
    Array.from(this.permissions.values())
      .filter(permission => {
        const permissionDate = new Date(permission.date);
        return permissionDate >= startDate && permissionDate <= endDate && permission.status === "draft";
      })
      .forEach(permission => {
        this.permissions.set(permission.id, { ...permission, status: "published" });
      });
    
    return true;
  }
  
  async publishPermissions(permissionIds: number[]): Promise<boolean> {
    let success = true;
    
    permissionIds.forEach(id => {
      const permission = this.permissions.get(id);
      if (permission) {
        this.permissions.set(id, { ...permission, status: "published" });
      } else {
        success = false;
      }
    });
    
    return success;
  }
}

// Create the appropriate storage implementation based on database availability
export const storage: IStorage = db ? new DatabaseStorage(db) : new MemStorage();
