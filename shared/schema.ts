import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Activity type enum
export const activityTypeEnum = pgEnum('activity_type', [
  'check-in', 'breakfast', 'vendor', 'academic', 'stem', 'arts', 'recreation'
]);

// Program period enum
export const programPeriodEnum = pgEnum('program_period', [
  'before-school', 'after-school'
]);

// User roles enum
export const userRoleEnum = pgEnum('user_role', [
  'admin', 'staff', 'parent'
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull(),
  profileImageUrl: text("profile_image_url"),
});

// Staff table
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(), // e.g., "Coach", "Ms.", etc.
  specialties: text("specialties").array(),
  isActive: boolean("is_active").default(true),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  startTime: text("start_time").notNull(), // Using text for time format like "7:00"
  endTime: text("end_time").notNull(),     // Using text for time format like "7:45"
  date: text("date").notNull(),            // Date format "YYYY-MM-DD"
  activityType: activityTypeEnum("activity_type").notNull(),
  programPeriod: programPeriodEnum("program_period").notNull(),
  studentCount: integer("student_count").default(0),
});

// Staff-Activity assignments
export const staffActivities = pgTable("staff_activities", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").references(() => staff.id),
  activityId: integer("activity_id").references(() => activities.id),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(), // Format: "YYYY-MM-DD HH:MM"
  authorId: integer("author_id").references(() => users.id),
  targetAudience: text("target_audience").array(), // e.g., ["Parents", "Staff", "Event"]
});

// Insert schemas and types
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
  profileImageUrl: true,
});

export const insertStaffSchema = createInsertSchema(staff).pick({
  userId: true,
  title: true,
  specialties: true,
  isActive: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  name: true,
  description: true,
  location: true,
  startTime: true,
  endTime: true,
  date: true,
  activityType: true,
  programPeriod: true,
  studentCount: true,
});

export const insertStaffActivitySchema = createInsertSchema(staffActivities).pick({
  staffId: true,
  activityId: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  title: true,
  content: true,
  createdAt: true,
  authorId: true,
  targetAudience: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertStaffActivity = z.infer<typeof insertStaffActivitySchema>;
export type StaffActivity = typeof staffActivities.$inferSelect;

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
