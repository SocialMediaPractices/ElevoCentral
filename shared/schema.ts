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

// Behavior tier enum
export const behaviorTierEnum = pgEnum('behavior_tier', [
  'good-standing', 'tier-1', 'tier-2', 'tier-3', 'suspended'
]);

// Behavior incident type enum
export const incidentTypeEnum = pgEnum('incident_type', [
  'disruption', 'disrespect', 'physical', 'property-damage', 'bullying', 'other'
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

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  grade: text("grade").notNull(),
  parentId: integer("parent_id").references(() => users.id),
  profileImageUrl: text("profile_image_url"),
  emergencyContact: text("emergency_contact"),
  medicalNotes: text("medical_notes"),
  currentTier: behaviorTierEnum("current_tier").default("good-standing").notNull(),
  tierUpdateDate: text("tier_update_date"), // Format: "YYYY-MM-DD"
});

// Behavior incidents table
export const behaviorIncidents = pgTable("behavior_incidents", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  reportedByStaffId: integer("reported_by_staff_id").references(() => staff.id),
  incidentDate: text("incident_date").notNull(), // Format: "YYYY-MM-DD"
  incidentTime: text("incident_time").notNull(), // Format: "HH:MM"
  incidentType: incidentTypeEnum("incident_type").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  witnessNames: text("witness_names").array(),
  actionTaken: text("action_taken"),
  parentNotified: boolean("parent_notified").default(false),
  parentNotificationDate: text("parent_notification_date"), // Format: "YYYY-MM-DD"
  followUpRequired: boolean("follow_up_required").default(false),
  isResolved: boolean("is_resolved").default(false),
});

// Behavior notes table (for general comments/observations)
export const behaviorNotes = pgTable("behavior_notes", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  staffId: integer("staff_id").references(() => staff.id),
  date: text("date").notNull(), // Format: "YYYY-MM-DD"
  time: text("time").notNull(), // Format: "HH:MM"
  note: text("note").notNull(),
  isPositive: boolean("is_positive").default(true),
  isPrivate: boolean("is_private").default(false), // If true, not shared with parents
  parentRead: boolean("parent_read").default(false),
});

// Tier transition records
export const tierTransitions = pgTable("tier_transitions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  fromTier: behaviorTierEnum("from_tier").notNull(),
  toTier: behaviorTierEnum("to_tier").notNull(),
  date: text("date").notNull(), // Format: "YYYY-MM-DD"
  reason: text("reason").notNull(),
  authorizedById: integer("authorized_by_id").references(() => staff.id),
  parentNotified: boolean("parent_notified").default(false),
  parentNotificationDate: text("parent_notification_date"), // Format: "YYYY-MM-DD"
  incidentIds: integer("incident_ids").array(),
});

// Insert schemas for new tables
export const insertStudentSchema = createInsertSchema(students).pick({
  firstName: true,
  lastName: true,
  grade: true,
  parentId: true,
  profileImageUrl: true,
  emergencyContact: true,
  medicalNotes: true,
  currentTier: true,
  tierUpdateDate: true,
});

export const insertBehaviorIncidentSchema = createInsertSchema(behaviorIncidents).pick({
  studentId: true,
  reportedByStaffId: true,
  incidentDate: true,
  incidentTime: true,
  incidentType: true,
  description: true,
  location: true,
  witnessNames: true,
  actionTaken: true,
  parentNotified: true,
  parentNotificationDate: true,
  followUpRequired: true,
  isResolved: true,
});

export const insertBehaviorNoteSchema = createInsertSchema(behaviorNotes).pick({
  studentId: true,
  staffId: true,
  date: true,
  time: true,
  note: true,
  isPositive: true,
  isPrivate: true,
  parentRead: true,
});

export const insertTierTransitionSchema = createInsertSchema(tierTransitions).pick({
  studentId: true,
  fromTier: true,
  toTier: true,
  date: true,
  reason: true,
  authorizedById: true,
  parentNotified: true,
  parentNotificationDate: true,
  incidentIds: true,
});

// Additional types for new tables
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertBehaviorIncident = z.infer<typeof insertBehaviorIncidentSchema>;
export type BehaviorIncident = typeof behaviorIncidents.$inferSelect;

export type InsertBehaviorNote = z.infer<typeof insertBehaviorNoteSchema>;
export type BehaviorNote = typeof behaviorNotes.$inferSelect;

export type InsertTierTransition = z.infer<typeof insertTierTransitionSchema>;
export type TierTransition = typeof tierTransitions.$inferSelect;

// Homework schema
export const homeworkAssignments = pgTable("homework_assignments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  activityId: integer("activity_id").notNull().references(() => activities.id),
  assignedByStaffId: integer("assigned_by_staff_id").notNull().references(() => staff.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: text("due_date").notNull(), // YYYY-MM-DD format
  assignedDate: text("assigned_date").notNull(), // YYYY-MM-DD format
  status: text("status").notNull().default("pending"), // pending, completed, overdue
  priority: text("priority").notNull().default("normal"), // low, normal, high
  completedDate: text("completed_date"),
  completionNotes: text("completion_notes"),
  verifiedByStaffId: integer("verified_by_staff_id").references(() => staff.id),
  verificationDate: text("verification_date"),
  parentNotified: boolean("parent_notified").default(false),
});

export const insertHomeworkAssignmentSchema = createInsertSchema(homeworkAssignments).pick({
  studentId: true,
  activityId: true,
  assignedByStaffId: true,
  title: true,
  description: true,
  dueDate: true,
  assignedDate: true,
  status: true,
  priority: true,
  completedDate: true,
  completionNotes: true,
  verifiedByStaffId: true,
  verificationDate: true,
  parentNotified: true,
});

export type InsertHomeworkAssignment = z.infer<typeof insertHomeworkAssignmentSchema>;
export type HomeworkAssignment = typeof homeworkAssignments.$inferSelect;

