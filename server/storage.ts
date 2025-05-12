import { 
  users, type User, type InsertUser,
  employees, type Employee, type InsertEmployee,
  shifts, type Shift, type InsertShift,
  schedules, type Schedule, type InsertSchedule,
  type ShiftWithEmployee
} from "@shared/schema";

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
  
  // Shift methods
  getShifts(): Promise<Shift[]>;
  getShiftsByEmployee(employeeId: number): Promise<Shift[]>;
  getShiftsByWeek(startDate: Date, endDate: Date): Promise<ShiftWithEmployee[]>;
  getShift(id: number): Promise<Shift | undefined>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: number, shift: Partial<InsertShift>): Promise<Shift | undefined>;
  deleteShift(id: number): Promise<boolean>;
  
  // Schedule methods
  getSchedules(): Promise<Schedule[]>;
  getScheduleByWeek(startDate: Date): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  
  // Bulk operations
  publishSchedule(scheduleId: number): Promise<boolean>;
  publishShifts(shiftIds: number[]): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private employees: Map<number, Employee>;
  private shifts: Map<number, Shift>;
  private schedules: Map<number, Schedule>;
  
  private currentUserId: number;
  private currentEmployeeId: number;
  private currentShiftId: number;
  private currentScheduleId: number;

  constructor() {
    this.users = new Map();
    this.employees = new Map();
    this.shifts = new Map();
    this.schedules = new Map();
    
    this.currentUserId = 1;
    this.currentEmployeeId = 1;
    this.currentShiftId = 1;
    this.currentScheduleId = 1;
    
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
    
    // Create current week schedule
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    this.createSchedule({
      weekStartDate: startOfWeek,
      weekEndDate: endOfWeek,
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
  
  // Shift methods
  async getShifts(): Promise<Shift[]> {
    return Array.from(this.shifts.values());
  }
  
  async getShiftsByEmployee(employeeId: number): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter(
      (shift) => shift.employeeId === employeeId
    );
  }
  
  async getShiftsByWeek(startDate: Date, endDate: Date): Promise<ShiftWithEmployee[]> {
    const shifts = Array.from(this.shifts.values()).filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= startDate && shiftDate <= endDate;
    });
    
    return shifts.map(shift => {
      const employee = this.employees.get(shift.employeeId);
      if (!employee) {
        throw new Error(`Employee with ID ${shift.employeeId} not found`);
      }
      return { ...shift, employee };
    });
  }
  
  async getShift(id: number): Promise<Shift | undefined> {
    return this.shifts.get(id);
  }
  
  async createShift(shift: InsertShift): Promise<Shift> {
    const id = this.currentShiftId++;
    const newShift: Shift = { ...shift, id };
    this.shifts.set(id, newShift);
    return newShift;
  }
  
  async updateShift(id: number, shift: Partial<InsertShift>): Promise<Shift | undefined> {
    const existingShift = this.shifts.get(id);
    if (!existingShift) return undefined;
    
    const updatedShift = { ...existingShift, ...shift };
    this.shifts.set(id, updatedShift);
    return updatedShift;
  }
  
  async deleteShift(id: number): Promise<boolean> {
    return this.shifts.delete(id);
  }
  
  // Schedule methods
  async getSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values());
  }
  
  async getScheduleByWeek(startDate: Date): Promise<Schedule | undefined> {
    return Array.from(this.schedules.values()).find(
      (schedule) => new Date(schedule.weekStartDate).toDateString() === startDate.toDateString()
    );
  }
  
  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = this.currentScheduleId++;
    const newSchedule: Schedule = { ...schedule, id };
    this.schedules.set(id, newSchedule);
    return newSchedule;
  }
  
  async updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const existingSchedule = this.schedules.get(id);
    if (!existingSchedule) return undefined;
    
    const updatedSchedule = { ...existingSchedule, ...schedule };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }
  
  // Bulk operations
  async publishSchedule(scheduleId: number): Promise<boolean> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return false;
    
    // Update schedule status
    this.schedules.set(scheduleId, { ...schedule, status: "published" });
    
    // Update all related shifts to published
    const startDate = new Date(schedule.weekStartDate);
    const endDate = new Date(schedule.weekEndDate);
    
    Array.from(this.shifts.values())
      .filter(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate >= startDate && shiftDate <= endDate && shift.status === "draft";
      })
      .forEach(shift => {
        this.shifts.set(shift.id, { ...shift, status: "published" });
      });
    
    return true;
  }
  
  async publishShifts(shiftIds: number[]): Promise<boolean> {
    let success = true;
    
    shiftIds.forEach(id => {
      const shift = this.shifts.get(id);
      if (shift) {
        this.shifts.set(id, { ...shift, status: "published" });
      } else {
        success = false;
      }
    });
    
    return success;
  }
}

export const storage = new MemStorage();
