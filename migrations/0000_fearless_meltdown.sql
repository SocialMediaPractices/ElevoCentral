CREATE TYPE "public"."activity_type" AS ENUM('check-in', 'breakfast', 'vendor', 'academic', 'stem', 'arts', 'recreation');--> statement-breakpoint
CREATE TYPE "public"."behavior_tier" AS ENUM('good-standing', 'tier-1', 'tier-2', 'tier-3', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."incident_type" AS ENUM('disruption', 'disrespect', 'physical', 'property-damage', 'bullying', 'other');--> statement-breakpoint
CREATE TYPE "public"."program_period" AS ENUM('before-school', 'after-school');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('site-manager', 'youth-development-lead', 'coach', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'staff', 'parent');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"location" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"date" text NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"program_period" "program_period" NOT NULL,
	"student_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" text NOT NULL,
	"author_id" integer,
	"target_audience" text[]
);
--> statement-breakpoint
CREATE TABLE "behavior_incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"reported_by_staff_id" integer,
	"incident_date" text NOT NULL,
	"incident_time" text NOT NULL,
	"incident_type" "incident_type" NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"witness_names" text[],
	"action_taken" text,
	"parent_notified" boolean DEFAULT false,
	"parent_notification_date" text,
	"follow_up_required" boolean DEFAULT false,
	"is_resolved" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "behavior_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"staff_id" integer,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"note" text NOT NULL,
	"is_positive" boolean DEFAULT true,
	"is_private" boolean DEFAULT false,
	"parent_read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "homework_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"activity_id" integer NOT NULL,
	"assigned_by_staff_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"due_date" text NOT NULL,
	"assigned_date" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"completed_date" text,
	"completion_notes" text,
	"verified_by_staff_id" integer,
	"verification_date" text,
	"parent_notified" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"staff_role" "staff_role" DEFAULT 'other' NOT NULL,
	"title" text NOT NULL,
	"specialties" text[],
	"responsibilities" text[],
	"hire_date" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "staff_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_id" integer,
	"activity_id" integer
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"grade" text NOT NULL,
	"parent_id" integer,
	"profile_image_url" text,
	"emergency_contact" text,
	"medical_notes" text,
	"current_tier" "behavior_tier" DEFAULT 'good-standing' NOT NULL,
	"tier_update_date" text
);
--> statement-breakpoint
CREATE TABLE "tier_transitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"from_tier" "behavior_tier" NOT NULL,
	"to_tier" "behavior_tier" NOT NULL,
	"date" text NOT NULL,
	"reason" text NOT NULL,
	"authorized_by_id" integer,
	"parent_notified" boolean DEFAULT false,
	"parent_notification_date" text,
	"incident_ids" integer[]
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"role" "user_role" NOT NULL,
	"profile_image_url" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavior_incidents" ADD CONSTRAINT "behavior_incidents_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavior_incidents" ADD CONSTRAINT "behavior_incidents_reported_by_staff_id_staff_id_fk" FOREIGN KEY ("reported_by_staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavior_notes" ADD CONSTRAINT "behavior_notes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavior_notes" ADD CONSTRAINT "behavior_notes_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_assignments" ADD CONSTRAINT "homework_assignments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_assignments" ADD CONSTRAINT "homework_assignments_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_assignments" ADD CONSTRAINT "homework_assignments_assigned_by_staff_id_staff_id_fk" FOREIGN KEY ("assigned_by_staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_assignments" ADD CONSTRAINT "homework_assignments_verified_by_staff_id_staff_id_fk" FOREIGN KEY ("verified_by_staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_activities" ADD CONSTRAINT "staff_activities_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_activities" ADD CONSTRAINT "staff_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tier_transitions" ADD CONSTRAINT "tier_transitions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tier_transitions" ADD CONSTRAINT "tier_transitions_authorized_by_id_staff_id_fk" FOREIGN KEY ("authorized_by_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;