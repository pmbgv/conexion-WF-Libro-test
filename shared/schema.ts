import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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

// Permissions table (replaces shifts)
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // "Sin permiso", "Vacaciones", "Administrativo", etc.
  reason: text("reason"), // Optional reason or notes
  status: text("status").notNull().default("draft"), // "draft" or "published"
});

export const insertPermissionSchema = createInsertSchema(permissions).pick({
  employeeId: true,
  date: true,
  type: true,
  reason: true,
  status: true,
});

// Calendar periods table (replaces schedules, now handles monthly periods)
export const calendarPeriods = pgTable("calendar_periods", {
  id: serial("id").primaryKey(),
  monthStartDate: timestamp("month_start_date").notNull(),
  monthEndDate: timestamp("month_end_date").notNull(),
  status: text("status").notNull().default("draft"), // "draft" or "published"
  statistics: json("statistics"),
});

export const insertCalendarPeriodSchema = createInsertSchema(calendarPeriods).pick({
  monthStartDate: true,
  monthEndDate: true,
  status: true,
  statistics: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;

export type InsertCalendarPeriod = z.infer<typeof insertCalendarPeriodSchema>;
export type CalendarPeriod = typeof calendarPeriods.$inferSelect;

// Extended types for UI
export type PermissionWithEmployee = Permission & {
  employee: Employee;
};

export type CalendarPeriodWithPermissions = CalendarPeriod & {
  permissions: PermissionWithEmployee[];
};

// Database relations
export const employeesRelations = relations(employees, ({ many }) => ({
  permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
  employee: one(employees, {
    fields: [permissions.employeeId],
    references: [employees.id],
  }),
}));

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  fecha: text("fecha").notNull(),
  texto: text("texto").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  fecha: true,
  texto: true,
  timestamp: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
