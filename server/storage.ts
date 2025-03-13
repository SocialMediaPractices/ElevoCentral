import {
  students, type Student, type InsertStudent,
  behaviorIncidents, type BehaviorIncident, type InsertBehaviorIncident,
  behaviorNotes, type BehaviorNote, type InsertBehaviorNote,
  tierTransitions, type TierTransition, type InsertTierTransition,
  users, type User, type InsertUser, 
  staff, type Staff, type InsertStaff,
  activities, type Activity, type InsertActivity,
  staffActivities, type StaffActivity, type InsertStaffActivity,
  announcements, type Announcement, type InsertAnnouncement,
  homeworkAssignments, type HomeworkAssignment, type InsertHomeworkAssignment
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Staff methods
  getStaff(id: number): Promise<Staff | undefined>;
  getStaffByUserId(userId: number): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  getAllStaff(): Promise<Staff[]>;
  getActiveStaff(): Promise<Staff[]>;

  // Activity methods
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByDate(date: string): Promise<Activity[]>;
  getActivitiesByPeriod(date: string, period: string): Promise<Activity[]>;
  getAllActivities(): Promise<Activity[]>;
  
  // Staff-Activity methods
  assignStaffToActivity(assignment: InsertStaffActivity): Promise<StaffActivity>;
  getStaffForActivity(activityId: number): Promise<Staff[]>;
  getActivitiesForStaff(staffId: number): Promise<Activity[]>;
  getAllStaffActivities(): Promise<StaffActivity[]>;
  
  // Announcement methods
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAllAnnouncements(): Promise<Announcement[]>;
  getRecentAnnouncements(limit: number): Promise<Announcement[]>;

  // Student methods
  getStudent(id: number): Promise<Student | undefined>;
  getStudentsByParentId(parentId: number): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  getAllStudents(): Promise<Student[]>;
  getStudentsByTier(tier: string): Promise<Student[]>;
  updateStudentTier(studentId: number, tier: string, updateDate: string): Promise<Student>;
  
  // Behavior Incident methods
  getBehaviorIncident(id: number): Promise<BehaviorIncident | undefined>;
  createBehaviorIncident(incident: InsertBehaviorIncident): Promise<BehaviorIncident>;
  getIncidentsByStudent(studentId: number): Promise<BehaviorIncident[]>;
  getIncidentsByDate(date: string): Promise<BehaviorIncident[]>;
  getRecentIncidents(limit: number): Promise<BehaviorIncident[]>;
  resolveIncident(id: number, actionTaken: string): Promise<BehaviorIncident>;
  setParentNotified(id: number, notificationDate: string): Promise<BehaviorIncident>;
  
  // Behavior Notes methods
  getBehaviorNote(id: number): Promise<BehaviorNote | undefined>;
  createBehaviorNote(note: InsertBehaviorNote): Promise<BehaviorNote>;
  getNotesByStudent(studentId: number): Promise<BehaviorNote[]>;
  getRecentNotes(limit: number): Promise<BehaviorNote[]>;
  getParentVisibleNotes(studentId: number): Promise<BehaviorNote[]>;
  markNoteAsReadByParent(id: number): Promise<BehaviorNote>;
  
  // Tier Transition methods
  getTierTransition(id: number): Promise<TierTransition | undefined>;
  createTierTransition(transition: InsertTierTransition): Promise<TierTransition>;
  getTransitionsByStudent(studentId: number): Promise<TierTransition[]>;
  getRecentTransitions(limit: number): Promise<TierTransition[]>;
  
  // Homework methods
  getHomeworkAssignment(id: number): Promise<HomeworkAssignment | undefined>;
  createHomeworkAssignment(assignment: InsertHomeworkAssignment): Promise<HomeworkAssignment>;
  getHomeworkByStudent(studentId: number): Promise<HomeworkAssignment[]>;
  getHomeworkByActivity(activityId: number): Promise<HomeworkAssignment[]>;
  getHomeworkByStaff(staffId: number): Promise<HomeworkAssignment[]>;
  getPendingHomework(): Promise<HomeworkAssignment[]>;
  updateHomeworkStatus(id: number, status: string, completedDate?: string, completionNotes?: string): Promise<HomeworkAssignment>;
  verifyHomeworkCompletion(id: number, staffId: number): Promise<HomeworkAssignment>;
  notifyParentAboutHomework(id: number): Promise<HomeworkAssignment>;
}

export class MemStorage implements IStorage {
  // Data storage
  private students: Map<number, Student>;
  private behaviorIncidents: Map<number, BehaviorIncident>;
  private behaviorNotes: Map<number, BehaviorNote>;
  private tierTransitions: Map<number, TierTransition>;
  private users: Map<number, User>;
  private staff: Map<number, Staff>;
  private activities: Map<number, Activity>;
  private staffActivities: Map<number, StaffActivity>;
  private announcements: Map<number, Announcement>;
  
  // ID counters for auto-increment
  private userIdCounter: number;
  private staffIdCounter: number;
  private activityIdCounter: number;
  private staffActivityIdCounter: number;
  private announcementIdCounter: number;
  private studentIdCounter: number;
  private behaviorIncidentIdCounter: number;
  private behaviorNoteIdCounter: number;
  private tierTransitionIdCounter: number;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.staff = new Map();
    this.activities = new Map();
    this.staffActivities = new Map();
    this.announcements = new Map();
    this.students = new Map();
    this.behaviorIncidents = new Map();
    this.behaviorNotes = new Map();
    this.tierTransitions = new Map();
    
    // Initialize ID counters
    this.userIdCounter = 1;
    this.staffIdCounter = 1;
    this.activityIdCounter = 1;
    this.staffActivityIdCounter = 1;
    this.announcementIdCounter = 1;
    this.studentIdCounter = 1;
    this.behaviorIncidentIdCounter = 1;
    this.behaviorNoteIdCounter = 1;
    this.tierTransitionIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
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
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Staff methods
  async getStaff(id: number): Promise<Staff | undefined> {
    return this.staff.get(id);
  }
  
  async getStaffByUserId(userId: number): Promise<Staff | undefined> {
    return Array.from(this.staff.values()).find(
      (staff) => staff.userId === userId,
    );
  }
  
  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.staffIdCounter++;
    const staffMember: Staff = { ...insertStaff, id };
    this.staff.set(id, staffMember);
    return staffMember;
  }
  
  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }
  
  async getActiveStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values()).filter(
      (staff) => staff.isActive,
    );
  }

  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }
  
  async getActivitiesByDate(date: string): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.date === date,
    );
  }
  
  async getActivitiesByPeriod(date: string, period: string): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.date === date && activity.programPeriod === period,
    );
  }
  
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  // Staff-Activity methods
  async assignStaffToActivity(insertAssignment: InsertStaffActivity): Promise<StaffActivity> {
    const id = this.staffActivityIdCounter++;
    const assignment: StaffActivity = { ...insertAssignment, id };
    this.staffActivities.set(id, assignment);
    return assignment;
  }
  
  async getStaffForActivity(activityId: number): Promise<Staff[]> {
    const staffIds = Array.from(this.staffActivities.values())
      .filter(sa => sa.activityId === activityId)
      .map(sa => sa.staffId);
    
    return Array.from(this.staff.values()).filter(
      staff => staffIds.includes(staff.id)
    );
  }
  
  async getActivitiesForStaff(staffId: number): Promise<Activity[]> {
    const activityIds = Array.from(this.staffActivities.values())
      .filter(sa => sa.staffId === staffId)
      .map(sa => sa.activityId);
    
    return Array.from(this.activities.values()).filter(
      activity => activityIds.includes(activity.id)
    );
  }
  
  async getAllStaffActivities(): Promise<StaffActivity[]> {
    return Array.from(this.staffActivities.values());
  }

  // Announcement methods
  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }
  
  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.announcementIdCounter++;
    const announcement: Announcement = { ...insertAnnouncement, id };
    this.announcements.set(id, announcement);
    return announcement;
  }
  
  async getAllAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values());
  }
  
  async getRecentAnnouncements(limit: number): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  // Student methods
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentsByParentId(parentId: number): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      student => student.parentId === parentId
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.studentIdCounter++;
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudentsByTier(tier: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      student => student.currentTier === tier
    );
  }

  async updateStudentTier(studentId: number, tier: string, updateDate: string): Promise<Student> {
    const student = await this.getStudent(studentId);
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }
    
    const updatedStudent: Student = {
      ...student,
      currentTier: tier as any, // Cast to satisfy TypeScript
      tierUpdateDate: updateDate
    };
    
    this.students.set(studentId, updatedStudent);
    return updatedStudent;
  }

  // Behavior Incident methods
  async getBehaviorIncident(id: number): Promise<BehaviorIncident | undefined> {
    return this.behaviorIncidents.get(id);
  }

  async createBehaviorIncident(insertIncident: InsertBehaviorIncident): Promise<BehaviorIncident> {
    const id = this.behaviorIncidentIdCounter++;
    const incident: BehaviorIncident = { ...insertIncident, id };
    this.behaviorIncidents.set(id, incident);
    return incident;
  }

  async getIncidentsByStudent(studentId: number): Promise<BehaviorIncident[]> {
    return Array.from(this.behaviorIncidents.values())
      .filter(incident => incident.studentId === studentId);
  }

  async getIncidentsByDate(date: string): Promise<BehaviorIncident[]> {
    return Array.from(this.behaviorIncidents.values())
      .filter(incident => incident.incidentDate === date);
  }

  async getRecentIncidents(limit: number): Promise<BehaviorIncident[]> {
    return Array.from(this.behaviorIncidents.values())
      .sort((a, b) => {
        // Sort by date and time, most recent first
        const dateA = new Date(`${a.incidentDate} ${a.incidentTime}`);
        const dateB = new Date(`${b.incidentDate} ${b.incidentTime}`);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  async resolveIncident(id: number, actionTaken: string): Promise<BehaviorIncident> {
    const incident = await this.getBehaviorIncident(id);
    if (!incident) {
      throw new Error(`Incident with ID ${id} not found`);
    }
    
    const updatedIncident: BehaviorIncident = {
      ...incident,
      actionTaken,
      isResolved: true
    };
    
    this.behaviorIncidents.set(id, updatedIncident);
    return updatedIncident;
  }

  async setParentNotified(id: number, notificationDate: string): Promise<BehaviorIncident> {
    const incident = await this.getBehaviorIncident(id);
    if (!incident) {
      throw new Error(`Incident with ID ${id} not found`);
    }
    
    const updatedIncident: BehaviorIncident = {
      ...incident,
      parentNotified: true,
      parentNotificationDate: notificationDate
    };
    
    this.behaviorIncidents.set(id, updatedIncident);
    return updatedIncident;
  }

  // Behavior Notes methods
  async getBehaviorNote(id: number): Promise<BehaviorNote | undefined> {
    return this.behaviorNotes.get(id);
  }

  async createBehaviorNote(insertNote: InsertBehaviorNote): Promise<BehaviorNote> {
    const id = this.behaviorNoteIdCounter++;
    const note: BehaviorNote = { ...insertNote, id };
    this.behaviorNotes.set(id, note);
    return note;
  }

  async getNotesByStudent(studentId: number): Promise<BehaviorNote[]> {
    return Array.from(this.behaviorNotes.values())
      .filter(note => note.studentId === studentId)
      .sort((a, b) => {
        // Sort by date and time, most recent first
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
  }

  async getRecentNotes(limit: number): Promise<BehaviorNote[]> {
    return Array.from(this.behaviorNotes.values())
      .sort((a, b) => {
        // Sort by date and time, most recent first
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  async getParentVisibleNotes(studentId: number): Promise<BehaviorNote[]> {
    return Array.from(this.behaviorNotes.values())
      .filter(note => note.studentId === studentId && !note.isPrivate)
      .sort((a, b) => {
        // Sort by date and time, most recent first
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
  }

  async markNoteAsReadByParent(id: number): Promise<BehaviorNote> {
    const note = await this.getBehaviorNote(id);
    if (!note) {
      throw new Error(`Note with ID ${id} not found`);
    }
    
    const updatedNote: BehaviorNote = {
      ...note,
      parentRead: true
    };
    
    this.behaviorNotes.set(id, updatedNote);
    return updatedNote;
  }

  // Tier Transition methods
  async getTierTransition(id: number): Promise<TierTransition | undefined> {
    return this.tierTransitions.get(id);
  }

  async createTierTransition(insertTransition: InsertTierTransition): Promise<TierTransition> {
    const id = this.tierTransitionIdCounter++;
    const transition: TierTransition = { ...insertTransition, id };
    this.tierTransitions.set(id, transition);
    
    // Also update the student's current tier
    await this.updateStudentTier(
      transition.studentId,
      transition.toTier as string,
      transition.date
    );
    
    return transition;
  }

  async getTransitionsByStudent(studentId: number): Promise<TierTransition[]> {
    return Array.from(this.tierTransitions.values())
      .filter(transition => transition.studentId === studentId)
      .sort((a, b) => {
        // Sort by date, most recent first
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
  }

  async getRecentTransitions(limit: number): Promise<TierTransition[]> {
    return Array.from(this.tierTransitions.values())
      .sort((a, b) => {
        // Sort by date, most recent first
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  // Homework assignments storage
  private homeworkAssignments: Map<number, HomeworkAssignment> = new Map();
  private homeworkIdCounter: number = 1;

  // Homework methods implementation
  async getHomeworkAssignment(id: number): Promise<HomeworkAssignment | undefined> {
    return this.homeworkAssignments.get(id);
  }

  async createHomeworkAssignment(insertAssignment: InsertHomeworkAssignment): Promise<HomeworkAssignment> {
    const id = this.homeworkIdCounter++;
    const assignment: HomeworkAssignment = { ...insertAssignment, id };
    this.homeworkAssignments.set(id, assignment);
    return assignment;
  }

  async getHomeworkByStudent(studentId: number): Promise<HomeworkAssignment[]> {
    return Array.from(this.homeworkAssignments.values())
      .filter(homework => homework.studentId === studentId)
      .sort((a, b) => {
        // Sort by due date, closest first
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      });
  }

  async getHomeworkByActivity(activityId: number): Promise<HomeworkAssignment[]> {
    return Array.from(this.homeworkAssignments.values())
      .filter(homework => homework.activityId === activityId)
      .sort((a, b) => {
        // Sort by due date, closest first
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      });
  }

  async getHomeworkByStaff(staffId: number): Promise<HomeworkAssignment[]> {
    return Array.from(this.homeworkAssignments.values())
      .filter(homework => homework.assignedByStaffId === staffId)
      .sort((a, b) => {
        // Sort by due date, closest first
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      });
  }

  async getPendingHomework(): Promise<HomeworkAssignment[]> {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    return Array.from(this.homeworkAssignments.values())
      .filter(homework => 
        // Include homework that is pending or overdue
        (homework.status === 'pending' && homework.dueDate >= today) ||
        (homework.status === 'pending' && homework.dueDate < today)
      )
      .sort((a, b) => {
        // Sort by due date, closest first
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      });
  }

  async updateHomeworkStatus(
    id: number, 
    status: string, 
    completedDate?: string, 
    completionNotes?: string
  ): Promise<HomeworkAssignment> {
    const homework = await this.getHomeworkAssignment(id);
    if (!homework) {
      throw new Error(`Homework assignment with ID ${id} not found`);
    }
    
    const updatedHomework: HomeworkAssignment = {
      ...homework,
      status: status as any, // Type cast to satisfy TypeScript
      ...(completedDate && { completedDate }),
      ...(completionNotes && { completionNotes })
    };
    
    this.homeworkAssignments.set(id, updatedHomework);
    return updatedHomework;
  }

  async verifyHomeworkCompletion(id: number, staffId: number): Promise<HomeworkAssignment> {
    const homework = await this.getHomeworkAssignment(id);
    if (!homework) {
      throw new Error(`Homework assignment with ID ${id} not found`);
    }
    
    const updatedHomework: HomeworkAssignment = {
      ...homework,
      status: 'completed' as any, // Type cast to satisfy TypeScript
      verifiedByStaffId: staffId,
      verificationDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
    };
    
    this.homeworkAssignments.set(id, updatedHomework);
    return updatedHomework;
  }

  async notifyParentAboutHomework(id: number): Promise<HomeworkAssignment> {
    const homework = await this.getHomeworkAssignment(id);
    if (!homework) {
      throw new Error(`Homework assignment with ID ${id} not found`);
    }
    
    const updatedHomework: HomeworkAssignment = {
      ...homework,
      parentNotified: true
    };
    
    this.homeworkAssignments.set(id, updatedHomework);
    return updatedHomework;
  }

  // Initialize sample data for development
  private async initializeSampleData() {
    // Create users
    const adminUser = await this.createUser({
      username: "admin",
      password: "password", // In a real app, would be hashed
      fullName: "Sara Mitchell",
      role: "admin",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    });

    const staffUsers = [
      await this.createUser({
        username: "michael",
        password: "password",
        fullName: "Michael Brown",
        role: "staff",
        profileImageUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      }),
      await this.createUser({
        username: "sarah",
        password: "password",
        fullName: "Sarah Johnson",
        role: "staff",
        profileImageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      }),
      await this.createUser({
        username: "james",
        password: "password",
        fullName: "James Wilson",
        role: "staff",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      }),
      await this.createUser({
        username: "lisa",
        password: "password",
        fullName: "Lisa Garcia",
        role: "staff",
        profileImageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      }),
      await this.createUser({
        username: "daniel",
        password: "password",
        fullName: "Daniel Martinez",
        role: "staff",
        profileImageUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      }),
      await this.createUser({
        username: "rodriguez",
        password: "password",
        fullName: "Ana Rodriguez",
        role: "staff",
        profileImageUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      }),
      await this.createUser({
        username: "patel",
        password: "password",
        fullName: "Meera Patel",
        role: "staff",
        profileImageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      }),
      await this.createUser({
        username: "thompson",
        password: "password",
        fullName: "Robert Thompson",
        role: "staff",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      })
    ];
    
    // Create parent users
    const parentUsers = [
      await this.createUser({
        username: "parent1",
        password: "password",
        fullName: "Jennifer Davis",
        role: "parent",
        profileImageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      }),
      await this.createUser({
        username: "parent2",
        password: "password",
        fullName: "David Wilson",
        role: "parent",
        profileImageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      }),
      await this.createUser({
        username: "parent3",
        password: "password",
        fullName: "Maria Lopez",
        role: "parent",
        profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
      })
    ];

    // Create staff
    const staffMembers = [
      await this.createStaff({
        userId: staffUsers[0].id,
        title: "Coach",
        specialties: ["Morning Reading", "Games & Pickup"],
        isActive: true
      }),
      await this.createStaff({
        userId: staffUsers[1].id,
        title: "Coach",
        specialties: ["Breakfast", "Trinity Theater"],
        isActive: true
      }),
      await this.createStaff({
        userId: staffUsers[2].id,
        title: "Coach",
        specialties: ["Breakfast", "LabRats Science"],
        isActive: true
      }),
      await this.createStaff({
        userId: staffUsers[3].id,
        title: "Coach",
        specialties: ["CityHeights Drums", "Games & Pickup"],
        isActive: true
      }),
      await this.createStaff({
        userId: staffUsers[4].id,
        title: "Coach",
        specialties: ["Homework Help"],
        isActive: true
      }),
      await this.createStaff({
        userId: staffUsers[5].id,
        title: "Ms.",
        specialties: ["CityHeights Drums"],
        isActive: true
      }),
      await this.createStaff({
        userId: staffUsers[6].id,
        title: "Ms.",
        specialties: ["Trinity Theater"],
        isActive: true
      }),
      await this.createStaff({
        userId: staffUsers[7].id,
        title: "Mr.",
        specialties: ["LabRats Science"],
        isActive: true
      })
    ];

    // Current date
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Create activities
    const activities = [
      // Before school activities
      await this.createActivity({
        name: "Morning Reading Club",
        description: "Quiet reading time to start the day",
        location: "Library Room",
        startTime: "7:00",
        endTime: "7:45",
        date: today,
        activityType: "check-in",
        programPeriod: "before-school",
        studentCount: 12
      }),
      await this.createActivity({
        name: "Breakfast & Morning Games",
        description: "Breakfast and structured play time",
        location: "Main Hall",
        startTime: "7:45",
        endTime: "8:30",
        date: today,
        activityType: "breakfast",
        programPeriod: "before-school",
        studentCount: 32
      }),
      
      // After school activities
      await this.createActivity({
        name: "Snack & Free Play",
        description: "After school check-in and free play time",
        location: "Playground, Main Hall",
        startTime: "2:30",
        endTime: "3:15",
        date: today,
        activityType: "check-in",
        programPeriod: "after-school",
        studentCount: 42
      }),
      await this.createActivity({
        name: "CityHeights Drums",
        description: "Drum instruction from CityHeights Music",
        location: "Music Room",
        startTime: "3:15",
        endTime: "4:00",
        date: today,
        activityType: "vendor",
        programPeriod: "after-school",
        studentCount: 14
      }),
      await this.createActivity({
        name: "Homework Help",
        description: "Structured homework time with assistance",
        location: "Classroom B",
        startTime: "3:15",
        endTime: "4:00",
        date: today,
        activityType: "academic",
        programPeriod: "after-school",
        studentCount: 18
      }),
      await this.createActivity({
        name: "LabRats Science",
        description: "Hands-on science experiments",
        location: "Science Lab",
        startTime: "4:15",
        endTime: "5:00",
        date: today,
        activityType: "stem",
        programPeriod: "after-school",
        studentCount: 16
      }),
      await this.createActivity({
        name: "Trinity Theater",
        description: "Theater and drama activities",
        location: "Auditorium",
        startTime: "4:15",
        endTime: "5:00",
        date: today,
        activityType: "arts",
        programPeriod: "after-school",
        studentCount: 12
      }),
      await this.createActivity({
        name: "Games & Pickup",
        description: "Structured games and parent pickup",
        location: "Main Hall, Playground",
        startTime: "5:15",
        endTime: "6:00",
        date: today,
        activityType: "recreation",
        programPeriod: "after-school",
        studentCount: 30
      })
    ];

    // Assign staff to activities
    await this.assignStaffToActivity({ staffId: staffMembers[0].id, activityId: activities[0].id }); // Michael to Morning Reading
    await this.assignStaffToActivity({ staffId: staffMembers[1].id, activityId: activities[1].id }); // Sarah to Breakfast
    await this.assignStaffToActivity({ staffId: staffMembers[2].id, activityId: activities[1].id }); // James to Breakfast
    
    // All staff assigned to check-in
    for (let i = 0; i < staffMembers.length; i++) {
      await this.assignStaffToActivity({ staffId: staffMembers[i].id, activityId: activities[2].id });
    }
    
    await this.assignStaffToActivity({ staffId: staffMembers[3].id, activityId: activities[3].id }); // Lisa to CityHeights Drums
    await this.assignStaffToActivity({ staffId: staffMembers[5].id, activityId: activities[3].id }); // Ana to CityHeights Drums
    await this.assignStaffToActivity({ staffId: staffMembers[4].id, activityId: activities[4].id }); // Daniel to Homework Help
    await this.assignStaffToActivity({ staffId: staffMembers[2].id, activityId: activities[5].id }); // James to LabRats
    await this.assignStaffToActivity({ staffId: staffMembers[7].id, activityId: activities[5].id }); // Thompson to LabRats
    await this.assignStaffToActivity({ staffId: staffMembers[1].id, activityId: activities[6].id }); // Sarah to Trinity Theater
    await this.assignStaffToActivity({ staffId: staffMembers[6].id, activityId: activities[6].id }); // Patel to Trinity Theater
    await this.assignStaffToActivity({ staffId: staffMembers[0].id, activityId: activities[7].id }); // Michael to Games & Pickup
    await this.assignStaffToActivity({ staffId: staffMembers[3].id, activityId: activities[7].id }); // Lisa to Games & Pickup

    // Create announcements
    await this.createAnnouncement({
      title: "Spring Activity Fair Next Week",
      content: "Join us next Friday for our Spring Activity Fair! Students will have the opportunity to try out new enrichment activities for the upcoming season.",
      createdAt: today + " 09:15",
      authorId: adminUser.id,
      targetAudience: ["Parents", "Staff", "School-wide"]
    });
    
    await this.createAnnouncement({
      title: "Staff Meeting Today",
      content: "Reminder: All staff should attend the brief meeting at 2:15pm today to discuss next week's field trip logistics.",
      createdAt: today + " 08:30",
      authorId: adminUser.id,
      targetAudience: ["Staff"]
    });
    
    await this.createAnnouncement({
      title: "Parent-Teacher Conferences",
      content: "Parent-Teacher conferences will be held next Thursday and Friday. Please sign up for a slot using the online portal.",
      createdAt: (new Date(new Date(today).getTime() - 2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] + " 14:00",
      authorId: staffUsers[2].id,
      targetAudience: ["Parents", "School-wide"]
    });
    
    // Create students
    const students = [
      await this.createStudent({
        firstName: "Emma",
        lastName: "Davis",
        grade: "3",
        parentId: parentUsers[0].id,
        profileImageUrl: "https://images.unsplash.com/photo-1595778975603-47d677b0c055?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        emergencyContact: "Jennifer Davis (555-123-4567)",
        medicalNotes: "Mild peanut allergy",
        currentTier: "good-standing",
        tierUpdateDate: today
      }),
      await this.createStudent({
        firstName: "Noah",
        lastName: "Wilson",
        grade: "4",
        parentId: parentUsers[1].id,
        profileImageUrl: "https://images.unsplash.com/photo-1599766239563-698b0fad2a56?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        emergencyContact: "David Wilson (555-987-6543)",
        medicalNotes: null,
        currentTier: "tier-1",
        tierUpdateDate: (new Date(new Date(today).getTime() - 5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      }),
      await this.createStudent({
        firstName: "Sophia",
        lastName: "Lopez",
        grade: "2",
        parentId: parentUsers[2].id,
        profileImageUrl: "https://images.unsplash.com/photo-1595980592365-527b982b6cff?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        emergencyContact: "Maria Lopez (555-555-1234)",
        medicalNotes: "Asthma - has inhaler in backpack",
        currentTier: "good-standing",
        tierUpdateDate: today
      }),
      await this.createStudent({
        firstName: "Miguel",
        lastName: "Lopez",
        grade: "5",
        parentId: parentUsers[2].id,
        profileImageUrl: "https://images.unsplash.com/photo-1537645903825-5d4cb8013f1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        emergencyContact: "Maria Lopez (555-555-1234)",
        medicalNotes: null,
        currentTier: "tier-2",
        tierUpdateDate: (new Date(new Date(today).getTime() - 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      })
    ];
    
    // Create behavior incidents
    const incidents = [
      await this.createBehaviorIncident({
        studentId: students[1].id, // Noah
        reportedByStaffId: staffMembers[4].id, // Daniel
        incidentDate: (new Date(new Date(today).getTime() - 5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        incidentTime: "15:30",
        incidentType: "disruption",
        description: "Noah was repeatedly distracting other students during homework time by making loud noises.",
        location: "Classroom B",
        witnessNames: ["Lisa Garcia", "Sarah Johnson"],
        actionTaken: "Verbal warning and moved to separate table",
        parentNotified: true,
        parentNotificationDate: (new Date(new Date(today).getTime() - 5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        followUpRequired: false,
        isResolved: true
      }),
      await this.createBehaviorIncident({
        studentId: students[3].id, // Miguel
        reportedByStaffId: staffMembers[2].id, // James
        incidentDate: (new Date(new Date(today).getTime() - 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        incidentTime: "16:20",
        incidentType: "physical",
        description: "Miguel pushed another student during science activity when they disagreed about experiment steps.",
        location: "Science Lab",
        witnessNames: ["Robert Thompson"],
        actionTaken: "Separated students, timeout, discussion about appropriate conflict resolution",
        parentNotified: true,
        parentNotificationDate: (new Date(new Date(today).getTime() - 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        followUpRequired: true,
        isResolved: true
      }),
      await this.createBehaviorIncident({
        studentId: students[1].id, // Noah
        reportedByStaffId: staffMembers[0].id, // Michael
        incidentDate: today,
        incidentTime: "17:15",
        incidentType: "disrespect",
        description: "Noah used inappropriate language when asked to clean up after games time.",
        location: "Main Hall",
        witnessNames: ["Lisa Garcia"],
        actionTaken: null,
        parentNotified: false,
        parentNotificationDate: null,
        followUpRequired: true,
        isResolved: false
      })
    ];
    
    // Create behavior notes
    await this.createBehaviorNote({
      studentId: students[0].id, // Emma
      staffId: staffMembers[1].id, // Sarah
      date: (new Date(new Date(today).getTime() - 1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      time: "15:45",
      note: "Emma showed great leadership skills today by helping other students during arts and crafts.",
      isPositive: true,
      isPrivate: false,
      parentRead: true
    });
    
    await this.createBehaviorNote({
      studentId: students[1].id, // Noah
      staffId: staffMembers[4].id, // Daniel
      date: (new Date(new Date(today).getTime() - 5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      time: "15:45",
      note: "Noah continues to struggle with following directions. Consider additional intervention strategies.",
      isPositive: false,
      isPrivate: true,
      parentRead: false
    });
    
    await this.createBehaviorNote({
      studentId: students[2].id, // Sophia
      staffId: staffMembers[3].id, // Lisa
      date: today,
      time: "14:00",
      note: "Sophia is showing great improvement in music class. She volunteered to demonstrate for the group today.",
      isPositive: true,
      isPrivate: false,
      parentRead: false
    });
    
    await this.createBehaviorNote({
      studentId: students[3].id, // Miguel
      staffId: staffMembers[2].id, // James
      date: (new Date(new Date(today).getTime() - 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      time: "16:40",
      note: "Follow-up discussion with Miguel about the incident. He showed remorse and apologized to the other student.",
      isPositive: false,
      isPrivate: false,
      parentRead: true
    });
    
    // Create tier transitions
    await this.createTierTransition({
      studentId: students[1].id, // Noah
      fromTier: "good-standing",
      toTier: "tier-1",
      date: (new Date(new Date(today).getTime() - 5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      reason: "Repeated classroom disruptions",
      authorizedById: staffMembers[4].id, // Daniel
      parentNotified: true,
      parentNotificationDate: (new Date(new Date(today).getTime() - 5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      incidentIds: [incidents[0].id]
    });
    
    await this.createTierTransition({
      studentId: students[3].id, // Miguel
      fromTier: "tier-1",
      toTier: "tier-2",
      date: (new Date(new Date(today).getTime() - 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      reason: "Physical altercation with another student",
      authorizedById: staffMembers[2].id, // James
      parentNotified: true,
      parentNotificationDate: (new Date(new Date(today).getTime() - 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      incidentIds: [incidents[1].id]
    });
  }
}

export const storage = new MemStorage();
