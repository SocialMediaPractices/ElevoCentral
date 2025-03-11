import { 
  users, type User, type InsertUser, 
  staff, type Staff, type InsertStaff,
  activities, type Activity, type InsertActivity,
  staffActivities, type StaffActivity, type InsertStaffActivity,
  announcements, type Announcement, type InsertAnnouncement
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private staff: Map<number, Staff>;
  private activities: Map<number, Activity>;
  private staffActivities: Map<number, StaffActivity>;
  private announcements: Map<number, Announcement>;
  
  private userIdCounter: number;
  private staffIdCounter: number;
  private activityIdCounter: number;
  private staffActivityIdCounter: number;
  private announcementIdCounter: number;

  constructor() {
    this.users = new Map();
    this.staff = new Map();
    this.activities = new Map();
    this.staffActivities = new Map();
    this.announcements = new Map();
    
    this.userIdCounter = 1;
    this.staffIdCounter = 1;
    this.activityIdCounter = 1;
    this.staffActivityIdCounter = 1;
    this.announcementIdCounter = 1;
    
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
      title: "Fall Festival Preparation - Volunteers Needed!",
      content: "Our annual Fall Festival is coming up on October 28th. We need parent volunteers to help with decorations, activities, and snack coordination. Please sign up at the front desk or contact Ms. Mitchell directly.",
      createdAt: `${today} 09:15`,
      authorId: adminUser.id,
      targetAudience: ["Parents", "Staff"]
    });
    
    await this.createAnnouncement({
      title: "Trinity Theater Showcase - Schedule Change",
      content: "The Trinity Theater group will be showcasing their fall performance on Friday, October 20th at 5:30 PM instead of the previously scheduled Thursday slot. All parents are invited to attend. The performance will last approximately 45 minutes.",
      createdAt: `${today} 11:32`,
      authorId: staffUsers[6].id,
      targetAudience: ["Parents", "Event"]
    });
    
    await this.createAnnouncement({
      title: "Staff Meeting - Wednesday Reminder",
      content: "Reminder that we have our monthly staff meeting this Wednesday at 6:15 PM after program hours. We'll be discussing the upcoming schedule changes, Fall Festival coordination, and professional development opportunities. Light dinner will be provided.",
      createdAt: `${today} 14:04`,
      authorId: adminUser.id,
      targetAudience: ["Staff Only"]
    });
  }
}

// Create storage instance
export const storage = new MemStorage();
