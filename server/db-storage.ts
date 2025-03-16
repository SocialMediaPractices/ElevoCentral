import { db } from './db';
import { eq, and, desc } from 'drizzle-orm';
import { 
  users, 
  staff, 
  activities, 
  staffActivities, 
  announcements,
  students,
  behaviorIncidents,
  behaviorNotes,
  tierTransitions,
  homeworkAssignments,
  type InsertUser, 
  type User, 
  type InsertStaff, 
  type Staff, 
  type InsertActivity, 
  type Activity, 
  type InsertStaffActivity, 
  type StaffActivity, 
  type InsertAnnouncement, 
  type Announcement,
  type InsertStudent,
  type Student,
  type InsertBehaviorIncident,
  type BehaviorIncident,
  type InsertBehaviorNote,
  type BehaviorNote,
  type InsertTierTransition,
  type TierTransition,
  type InsertHomeworkAssignment,
  type HomeworkAssignment
} from '@shared/schema';
import { IStorage } from './storage';

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const results = await db.insert(users).values(user).returning();
    return results[0];
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Staff methods
  async getStaff(id: number): Promise<Staff | undefined> {
    const results = await db.select().from(staff).where(eq(staff.id, id));
    return results[0];
  }

  async getStaffByUserId(userId: number): Promise<Staff | undefined> {
    const results = await db.select().from(staff).where(eq(staff.userId, userId));
    return results[0];
  }

  async createStaff(staffMember: InsertStaff): Promise<Staff> {
    const results = await db.insert(staff).values(staffMember).returning();
    return results[0];
  }

  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }

  async getActiveStaff(): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.isActive, true));
  }

  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    const results = await db.select().from(activities).where(eq(activities.id, id));
    return results[0];
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const results = await db.insert(activities).values(activity).returning();
    return results[0];
  }

  async getActivitiesByDate(date: string): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.date, date));
  }

  async getActivitiesByPeriod(date: string, period: string): Promise<Activity[]> {
    return await db.select().from(activities).where(
      and(
        eq(activities.date, date),
        // Cast the period to the expected enum type using the SQL function
        eq(activities.programPeriod, period as any)
      )
    );
  }

  async getAllActivities(): Promise<Activity[]> {
    return await db.select().from(activities);
  }

  // Staff-Activity methods
  async assignStaffToActivity(assignment: InsertStaffActivity): Promise<StaffActivity> {
    const results = await db.insert(staffActivities).values(assignment).returning();
    return results[0];
  }

  async getStaffForActivity(activityId: number): Promise<Staff[]> {
    const assignments = await db.select().from(staffActivities).where(eq(staffActivities.activityId, activityId));
    const staffIds = assignments.map(assignment => assignment.staffId).filter(id => id !== null) as number[];
    
    if (staffIds.length === 0) return [];
    
    const staffMembers: Staff[] = [];
    for (const staffId of staffIds) {
      const staffMember = await this.getStaff(staffId);
      if (staffMember) staffMembers.push(staffMember);
    }
    
    return staffMembers;
  }

  async getActivitiesForStaff(staffId: number): Promise<Activity[]> {
    const assignments = await db.select().from(staffActivities).where(eq(staffActivities.staffId, staffId));
    const activityIds = assignments.map(assignment => assignment.activityId).filter(id => id !== null) as number[];
    
    if (activityIds.length === 0) return [];
    
    const activityList: Activity[] = [];
    for (const activityId of activityIds) {
      const activity = await this.getActivity(activityId);
      if (activity) activityList.push(activity);
    }
    
    return activityList;
  }

  async getAllStaffActivities(): Promise<StaffActivity[]> {
    return await db.select().from(staffActivities);
  }

  // Announcement methods
  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const results = await db.select().from(announcements).where(eq(announcements.id, id));
    return results[0];
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const results = await db.insert(announcements).values(announcement).returning();
    return results[0];
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements);
  }

  async getRecentAnnouncements(limit: number): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt)).limit(limit);
  }

  // Student methods
  async getStudent(id: number): Promise<Student | undefined> {
    const results = await db.select().from(students).where(eq(students.id, id));
    return results[0];
  }

  async getStudentsByParentId(parentId: number): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.parentId, parentId));
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const results = await db.insert(students).values(student).returning();
    return results[0];
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudentsByTier(tier: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.currentTier, tier as any));
  }

  async updateStudentTier(studentId: number, tier: string, updateDate: string): Promise<Student> {
    const results = await db.update(students)
      .set({ currentTier: tier as any, tierUpdateDate: updateDate })
      .where(eq(students.id, studentId))
      .returning();
    return results[0];
  }

  // Behavior Incident methods
  async getBehaviorIncident(id: number): Promise<BehaviorIncident | undefined> {
    const results = await db.select().from(behaviorIncidents).where(eq(behaviorIncidents.id, id));
    return results[0];
  }

  async createBehaviorIncident(incident: InsertBehaviorIncident): Promise<BehaviorIncident> {
    const results = await db.insert(behaviorIncidents).values(incident).returning();
    return results[0];
  }

  async getIncidentsByStudent(studentId: number): Promise<BehaviorIncident[]> {
    return await db.select().from(behaviorIncidents).where(eq(behaviorIncidents.studentId, studentId));
  }

  async getIncidentsByDate(date: string): Promise<BehaviorIncident[]> {
    return await db.select().from(behaviorIncidents).where(eq(behaviorIncidents.incidentDate, date));
  }

  async getRecentIncidents(limit: number): Promise<BehaviorIncident[]> {
    return await db.select().from(behaviorIncidents)
      .orderBy(desc(behaviorIncidents.incidentDate), desc(behaviorIncidents.incidentTime))
      .limit(limit);
  }

  async resolveIncident(id: number, actionTaken: string): Promise<BehaviorIncident> {
    const results = await db.update(behaviorIncidents)
      .set({ isResolved: true, actionTaken })
      .where(eq(behaviorIncidents.id, id))
      .returning();
    return results[0];
  }

  async setParentNotified(id: number, notificationDate: string): Promise<BehaviorIncident> {
    const results = await db.update(behaviorIncidents)
      .set({ parentNotified: true, parentNotificationDate: notificationDate })
      .where(eq(behaviorIncidents.id, id))
      .returning();
    return results[0];
  }

  // Behavior Notes methods
  async getBehaviorNote(id: number): Promise<BehaviorNote | undefined> {
    const results = await db.select().from(behaviorNotes).where(eq(behaviorNotes.id, id));
    return results[0];
  }

  async createBehaviorNote(note: InsertBehaviorNote): Promise<BehaviorNote> {
    const results = await db.insert(behaviorNotes).values(note).returning();
    return results[0];
  }

  async getNotesByStudent(studentId: number): Promise<BehaviorNote[]> {
    return await db.select().from(behaviorNotes).where(eq(behaviorNotes.studentId, studentId));
  }

  async getRecentNotes(limit: number): Promise<BehaviorNote[]> {
    return await db.select().from(behaviorNotes)
      .orderBy(desc(behaviorNotes.date), desc(behaviorNotes.time))
      .limit(limit);
  }

  async getParentVisibleNotes(studentId: number): Promise<BehaviorNote[]> {
    return await db.select().from(behaviorNotes)
      .where(
        and(
          eq(behaviorNotes.studentId, studentId),
          eq(behaviorNotes.isPrivate, false)
        )
      );
  }

  async markNoteAsReadByParent(id: number): Promise<BehaviorNote> {
    const results = await db.update(behaviorNotes)
      .set({ parentRead: true })
      .where(eq(behaviorNotes.id, id))
      .returning();
    return results[0];
  }

  // Tier Transition methods
  async getTierTransition(id: number): Promise<TierTransition | undefined> {
    const results = await db.select().from(tierTransitions).where(eq(tierTransitions.id, id));
    return results[0];
  }

  async createTierTransition(transition: InsertTierTransition): Promise<TierTransition> {
    const results = await db.insert(tierTransitions).values(transition).returning();
    return results[0];
  }

  async getTransitionsByStudent(studentId: number): Promise<TierTransition[]> {
    return await db.select().from(tierTransitions).where(eq(tierTransitions.studentId, studentId));
  }

  async getRecentTransitions(limit: number): Promise<TierTransition[]> {
    return await db.select().from(tierTransitions)
      .orderBy(desc(tierTransitions.date))
      .limit(limit);
  }

  // Homework methods
  async getHomeworkAssignment(id: number): Promise<HomeworkAssignment | undefined> {
    const results = await db.select().from(homeworkAssignments).where(eq(homeworkAssignments.id, id));
    return results[0];
  }

  async createHomeworkAssignment(assignment: InsertHomeworkAssignment): Promise<HomeworkAssignment> {
    const results = await db.insert(homeworkAssignments).values(assignment).returning();
    return results[0];
  }

  async getHomeworkByStudent(studentId: number): Promise<HomeworkAssignment[]> {
    return await db.select().from(homeworkAssignments).where(eq(homeworkAssignments.studentId, studentId));
  }

  async getHomeworkByActivity(activityId: number): Promise<HomeworkAssignment[]> {
    return await db.select().from(homeworkAssignments).where(eq(homeworkAssignments.activityId, activityId));
  }

  async getHomeworkByStaff(staffId: number): Promise<HomeworkAssignment[]> {
    return await db.select().from(homeworkAssignments).where(eq(homeworkAssignments.assignedByStaffId, staffId));
  }

  async getPendingHomework(): Promise<HomeworkAssignment[]> {
    return await db.select().from(homeworkAssignments).where(eq(homeworkAssignments.status, 'pending'));
  }

  async getAllHomeworkAssignments(): Promise<HomeworkAssignment[]> {
    return await db.select().from(homeworkAssignments);
  }

  async updateHomeworkStatus(
    id: number, 
    status: string, 
    completedDate?: string, 
    completionNotes?: string
  ): Promise<HomeworkAssignment> {
    const updateData: any = { status };
    if (completedDate) updateData.completedDate = completedDate;
    if (completionNotes) updateData.completionNotes = completionNotes;
    
    const results = await db.update(homeworkAssignments)
      .set(updateData)
      .where(eq(homeworkAssignments.id, id))
      .returning();
    return results[0];
  }

  async verifyHomeworkCompletion(id: number, staffId: number): Promise<HomeworkAssignment> {
    const results = await db.update(homeworkAssignments)
      .set({ 
        verifiedByStaffId: staffId, 
        verificationDate: new Date().toISOString().split('T')[0]  // Today's date in YYYY-MM-DD format
      })
      .where(eq(homeworkAssignments.id, id))
      .returning();
    return results[0];
  }

  async notifyParentAboutHomework(id: number): Promise<HomeworkAssignment> {
    const results = await db.update(homeworkAssignments)
      .set({ parentNotified: true })
      .where(eq(homeworkAssignments.id, id))
      .returning();
    return results[0];
  }
}