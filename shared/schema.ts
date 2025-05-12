import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (admin users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Employees table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  email: text("email").notNull().unique(),
  initials: text("initials").notNull(),
  active: boolean("active").notNull().default(true),
});

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  name: true,
  position: true,
  email: true,
  initials: true,
  active: true,
});

// Shifts table
export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  position: text("position").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("draft"), // "draft" or "published"
});

export const insertShiftSchema = createInsertSchema(shifts).pick({
  employeeId: true,
  date: true,
  startTime: true,
  endTime: true,
  position: true,
  notes: true,
  status: true,
});

// Schedule table
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  weekStartDate: timestamp("week_start_date").notNull(),
  weekEndDate: timestamp("week_end_date").notNull(),
  status: text("status").notNull().default("draft"), // "draft" or "published"
  statistics: json("statistics"),
});

export const insertScheduleSchema = createInsertSchema(schedules).pick({
  weekStartDate: true,
  weekEndDate: true,
  status: true,
  statistics: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Shift = typeof shifts.$inferSelect;

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

// Extended types for UI
export type ShiftWithEmployee = Shift & {
  employee: Employee;
};

export type ScheduleWithShifts = Schedule & {
  shifts: ShiftWithEmployee[];
};
