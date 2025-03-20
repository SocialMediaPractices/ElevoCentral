import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertActivitySchema, 
  insertAnnouncementSchema, 
  insertStaffSchema, 
  insertStaffActivitySchema, 
  insertUserSchema,
  insertStudentSchema,
  insertBehaviorIncidentSchema,
  insertBehaviorNoteSchema,
  insertTierTransitionSchema,
  insertHomeworkAssignmentSchema,
  HomeworkAssignment,
  BehaviorNote,
  BehaviorIncident
} from "@shared/schema";
import passport from "./auth";
import { hashPassword, hasRole, hasPermission } from "./auth";
import { WebSocket, WebSocketServer } from 'ws';

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({
          message: info?.message || "Authentication failed",
          success: false
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Don't send the password back to the client
        const userResponse = {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          profileImageUrl: user.profileImageUrl
        };
        
        return res.json({
          message: "Login successful",
          success: true,
          user: userResponse
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, fullName, role = "parent" } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          message: "Username already exists",
          success: false
        });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create the user with hashed password
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        fullName,
        role,
        profileImageUrl: null
      });
      
      // Don't send the password back to the client
      const userResponse = {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        profileImageUrl: newUser.profileImageUrl
      };
      
      return res.status(201).json({
        message: "Registration successful",
        success: true,
        user: userResponse
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        message: "Registration failed",
        success: false
      });
    }
  });

  app.get("/api/auth/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Not authenticated",
        success: false
      });
    }
    
    // Don't send the password back to the client
    const user = req.user as any;
    const userResponse = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      profileImageUrl: user.profileImageUrl
    };
    
    return res.json({
      user: userResponse,
      success: true
    });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          message: "Logout failed",
          success: false
        });
      }
      
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            message: "Session destruction failed",
            success: false
          });
        }
        
        res.clearCookie("connect.sid");
        return res.json({
          message: "Logout successful",
          success: true
        });
      });
    });
  });

  // API Routes - prefix all routes with /api
  
  // Users routes
  app.get("/api/users", hasRole('admin'), async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });
  
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });
  
  app.post("/api/users", hasRole('admin'), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });
  
  // Staff routes
  app.get("/api/staff", hasRole(['admin', 'staff'], true), async (req, res) => {
    const { active } = req.query;
    const staff = active === "true" 
      ? await storage.getActiveStaff() 
      : await storage.getAllStaff();
    res.json(staff);
  });
  
  app.get("/api/staff/:id", hasRole(['admin', 'staff']), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }
    
    const staffMember = await storage.getStaff(id);
    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    
    res.json(staffMember);
  });
  
  app.post("/api/staff", hasRole('admin'), async (req, res) => {
    try {
      const staffData = insertStaffSchema.parse(req.body);
      const staffMember = await storage.createStaff(staffData);
      res.status(201).json(staffMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid staff data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create staff member" });
      }
    }
  });
  
  // Activities routes
  app.get("/api/activities", hasPermission('view-activities', true), async (req, res) => {
    const { date, period } = req.query;
    
    let activities;
    if (date && period) {
      activities = await storage.getActivitiesByPeriod(date as string, period as string);
    } else if (date) {
      activities = await storage.getActivitiesByDate(date as string);
    } else {
      activities = await storage.getAllActivities();
    }
    
    const activitiesWithStaff = await Promise.all(
      activities.map(async (activity) => {
        const staff = await storage.getStaffForActivity(activity.id);
        return {
          ...activity,
          staff
        };
      })
    );
    
    res.json(activitiesWithStaff);
  });
  
  app.get("/api/activities/:id", hasPermission('view-activities'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }
    
    const activity = await storage.getActivity(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    const staff = await storage.getStaffForActivity(id);
    
    res.json({
      ...activity,
      staff
    });
  });
  
  app.post("/api/activities", hasRole(['staff', 'admin']), async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create activity" });
      }
    }
  });
  
  // Staff-Activity assignments
  app.post("/api/staff-activities", hasRole(['admin', 'staff']), async (req, res) => {
    try {
      const assignmentData = insertStaffActivitySchema.parse(req.body);
      const assignment = await storage.assignStaffToActivity(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create assignment" });
      }
    }
  });
  
  app.get("/api/staff/:id/activities", hasRole(['admin', 'staff']), async (req, res) => {
    const staffId = parseInt(req.params.id);
    if (isNaN(staffId)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }
    
    const activities = await storage.getActivitiesForStaff(staffId);
    res.json(activities);
  });
  
  app.get("/api/activities/:id/staff", hasRole(['admin', 'staff']), async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }
    
    const staff = await storage.getStaffForActivity(activityId);
    res.json(staff);
  });
  
  // Announcements routes
  app.get("/api/announcements", hasPermission('view-announcements', true), async (req, res) => {
    const { limit } = req.query;
    
    let announcements;
    if (limit) {
      announcements = await storage.getRecentAnnouncements(parseInt(limit as string));
    } else {
      announcements = await storage.getAllAnnouncements();
    }
    
    const announcementsWithAuthor = await Promise.all(
      announcements.map(async (announcement) => {
        const author = announcement.authorId ? await storage.getUser(announcement.authorId) : null;
        return {
          ...announcement,
          author: author ? {
            id: author.id,
            fullName: author.fullName,
            profileImageUrl: author.profileImageUrl
          } : undefined
        };
      })
    );
    
    res.json(announcementsWithAuthor);
  });
  
  app.get("/api/announcements/:id", hasPermission('view-announcements'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid announcement ID" });
    }
    
    const announcement = await storage.getAnnouncement(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    
    const author = announcement.authorId ? await storage.getUser(announcement.authorId) : null;
    
    res.json({
      ...announcement,
      author: author ? {
        id: author.id,
        fullName: author.fullName,
        profileImageUrl: author.profileImageUrl
      } : undefined
    });
  });
  
  app.post("/api/announcements", hasRole('staff'), async (req, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(announcementData);
      
      const author = announcement.authorId ? await storage.getUser(announcement.authorId) : null;
      
      res.status(201).json({
        ...announcement,
        author: author ? {
          id: author.id,
          fullName: author.fullName,
          profileImageUrl: author.profileImageUrl
        } : undefined
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid announcement data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create announcement" });
      }
    }
  });
  
  // Students routes
  app.get("/api/students", hasRole(['staff', 'admin']), async (req, res) => {
    const { tier } = req.query;
    
    let students;
    if (tier) {
      students = await storage.getStudentsByTier(tier as string);
    } else {
      students = await storage.getAllStudents();
    }
    
    // Get parent info for each student
    const studentsWithParentInfo = await Promise.all(
      students.map(async (student) => {
        if (student.parentId) {
          const parent = await storage.getUser(student.parentId);
          return {
            ...student,
            parent: parent ? {
              id: parent.id,
              fullName: parent.fullName,
              profileImageUrl: parent.profileImageUrl
            } : undefined
          };
        }
        return student;
      })
    );
    
    res.json(studentsWithParentInfo);
  });
  
  app.get("/api/students/:id", hasPermission('student-records'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    
    const student = await storage.getStudent(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Get parent info
    let parentInfo = undefined;
    if (student.parentId) {
      const parent = await storage.getUser(student.parentId);
      if (parent) {
        parentInfo = {
          id: parent.id,
          fullName: parent.fullName,
          profileImageUrl: parent.profileImageUrl
        };
      }
    }
    
    res.json({
      ...student,
      parent: parentInfo
    });
  });
  
  app.post("/api/students", hasRole('staff'), async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid student data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create student" });
      }
    }
  });
  
  // Behavior Incidents routes
  app.get("/api/behavior-incidents", hasPermission('behavior-management'), async (req, res) => {
    const { studentId, date, limit } = req.query;
    
    let incidents;
    if (studentId) {
      incidents = await storage.getIncidentsByStudent(parseInt(studentId as string));
    } else if (date) {
      incidents = await storage.getIncidentsByDate(date as string);
    } else if (limit) {
      incidents = await storage.getRecentIncidents(parseInt(limit as string));
    } else {
      // Default to recent incidents if no filters are provided
      incidents = await storage.getRecentIncidents(10);
    }
    
    // Get student and reporter info for each incident
    const incidentsWithDetails = await Promise.all(
      incidents.map(async (incident) => {
        const student = incident.studentId ? await storage.getStudent(incident.studentId) : undefined;
        const reporter = incident.reportedByStaffId ? await storage.getStaff(incident.reportedByStaffId) : undefined;
        
        let reporterInfo = undefined;
        if (reporter && reporter.userId) {
          const reporterUser = await storage.getUser(reporter.userId);
          if (reporterUser) {
            reporterInfo = {
              id: reporter.id,
              name: reporterUser.fullName,
              title: reporter.title,
              profileImageUrl: reporterUser.profileImageUrl
            };
          }
        }
        
        return {
          ...incident,
          student: student ? {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            grade: student.grade,
            profileImageUrl: student.profileImageUrl
          } : undefined,
          reporter: reporterInfo
        };
      })
    );
    
    res.json(incidentsWithDetails);
  });
  
  app.get("/api/behavior-incidents/:id", hasPermission('behavior-management'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid incident ID" });
    }
    
    const incident = await storage.getBehaviorIncident(id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }
    
    const student = incident.studentId ? await storage.getStudent(incident.studentId) : undefined;
    const reporter = incident.reportedByStaffId ? await storage.getStaff(incident.reportedByStaffId) : undefined;
    
    let reporterInfo = undefined;
    if (reporter && reporter.userId) {
      const reporterUser = await storage.getUser(reporter.userId);
      if (reporterUser) {
        reporterInfo = {
          id: reporter.id,
          name: reporterUser.fullName,
          title: reporter.title,
          profileImageUrl: reporterUser.profileImageUrl
        };
      }
    }
    
    res.json({
      ...incident,
      student: student ? {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        profileImageUrl: student.profileImageUrl
      } : undefined,
      reporter: reporterInfo
    });
  });
  
  app.post("/api/behavior-incidents", hasRole('staff'), async (req, res) => {
    try {
      const incidentData = insertBehaviorIncidentSchema.parse(req.body);
      const incident = await storage.createBehaviorIncident(incidentData);
      res.status(201).json(incident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid incident data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create incident" });
      }
    }
  });
  
  app.patch("/api/behavior-incidents/:id/resolve", hasPermission('behavior-management'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid incident ID" });
    }
    
    const { actionTaken } = req.body;
    if (!actionTaken) {
      return res.status(400).json({ message: "Action taken is required" });
    }
    
    try {
      const updatedIncident = await storage.resolveIncident(id, actionTaken);
      res.json(updatedIncident);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve incident" });
    }
  });
  
  app.patch("/api/behavior-incidents/:id/notify-parent", hasPermission('parent-notifications'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid incident ID" });
    }
    
    const notificationDate = req.body.date || new Date().toISOString().split('T')[0];
    
    try {
      const updatedIncident = await storage.setParentNotified(id, notificationDate);
      res.json(updatedIncident);
    } catch (error) {
      res.status(500).json({ message: "Failed to update parent notification status" });
    }
  });
  
  // Behavior Notes routes
  app.get("/api/behavior-notes", hasRole(['staff', 'admin', 'parent']), async (req, res) => {
    const { studentId, limit, parentVisible } = req.query;
    
    let notes;
    if (studentId && parentVisible === "true") {
      notes = await storage.getParentVisibleNotes(parseInt(studentId as string));
    } else if (studentId) {
      notes = await storage.getNotesByStudent(parseInt(studentId as string));
    } else if (limit) {
      notes = await storage.getRecentNotes(parseInt(limit as string));
    } else {
      // Default to recent notes if no filters are provided
      notes = await storage.getRecentNotes(10);
    }
    
    // Get student and staff info for each note
    const notesWithDetails = await Promise.all(
      notes.map(async (note) => {
        const student = note.studentId ? await storage.getStudent(note.studentId) : undefined;
        const staffMember = note.staffId ? await storage.getStaff(note.staffId) : undefined;
        
        let staffInfo = undefined;
        if (staffMember && staffMember.userId) {
          const staffUser = await storage.getUser(staffMember.userId);
          if (staffUser) {
            staffInfo = {
              id: staffMember.id,
              name: staffUser.fullName,
              title: staffMember.title,
              profileImageUrl: staffUser.profileImageUrl
            };
          }
        }
        
        return {
          ...note,
          student: student ? {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            grade: student.grade,
            profileImageUrl: student.profileImageUrl
          } : undefined,
          staff: staffInfo
        };
      })
    );
    
    res.json(notesWithDetails);
  });
  
  app.post("/api/behavior-notes", hasRole(['staff', 'admin']), async (req, res) => {
    try {
      const noteData = insertBehaviorNoteSchema.parse(req.body);
      const note = await storage.createBehaviorNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid note data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create behavior note" });
      }
    }
  });
  
  app.patch("/api/behavior-notes/:id/mark-read", hasRole('parent'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }
    
    try {
      const updatedNote = await storage.markNoteAsReadByParent(id);
      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark note as read" });
    }
  });
  
  // Tier Transitions routes
  app.get("/api/tier-transitions", hasPermission('behavior-management'), async (req, res) => {
    const { studentId, limit } = req.query;
    
    let transitions;
    if (studentId) {
      transitions = await storage.getTransitionsByStudent(parseInt(studentId as string));
    } else if (limit) {
      transitions = await storage.getRecentTransitions(parseInt(limit as string));
    } else {
      // Default to recent transitions if no filters are provided
      transitions = await storage.getRecentTransitions(10);
    }
    
    // Get student and staff info for each transition
    const transitionsWithDetails = await Promise.all(
      transitions.map(async (transition) => {
        const student = transition.studentId ? await storage.getStudent(transition.studentId) : undefined;
        const authorizer = transition.authorizedById ? await storage.getStaff(transition.authorizedById) : undefined;
        
        let authorizerInfo = undefined;
        if (authorizer && authorizer.userId) {
          const authorizerUser = await storage.getUser(authorizer.userId);
          if (authorizerUser) {
            authorizerInfo = {
              id: authorizer.id,
              name: authorizerUser.fullName,
              title: authorizer.title,
              profileImageUrl: authorizerUser.profileImageUrl
            };
          }
        }
        
        return {
          ...transition,
          student: student ? {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            grade: student.grade,
            profileImageUrl: student.profileImageUrl
          } : undefined,
          authorizedBy: authorizerInfo
        };
      })
    );
    
    res.json(transitionsWithDetails);
  });
  
  app.post("/api/tier-transitions", hasPermission('behavior-management'), async (req, res) => {
    try {
      const transitionData = insertTierTransitionSchema.parse(req.body);
      const transition = await storage.createTierTransition(transitionData);
      res.status(201).json(transition);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transition data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tier transition" });
      }
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", hasRole(['admin', 'staff'], true), async (req, res) => {
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    
    const activities = await storage.getActivitiesByDate(date);
    const staff = await storage.getActiveStaff();
    const announcements = await storage.getRecentAnnouncements(3);
    
    // Calculate total students across all activities for today
    const studentCount = activities.reduce((total, activity) => total + (activity.studentCount || 0), 0);
    
    res.json({
      studentCount,
      activitiesCount: activities.length,
      staffCount: staff.length,
      announcementsCount: announcements.length
    });
  });

  // Homework assignments routes
  app.get("/api/homework", hasRole(['staff', 'admin', 'parent', 'student']), async (req, res) => {
    const { studentId, activityId, staffId, status } = req.query;
    
    let assignments;
    if (studentId) {
      assignments = await storage.getHomeworkByStudent(parseInt(studentId as string));
    } else if (activityId) {
      assignments = await storage.getHomeworkByActivity(parseInt(activityId as string));
    } else if (staffId) {
      assignments = await storage.getHomeworkByStaff(parseInt(staffId as string));
    } else if (status === "pending") {
      assignments = await storage.getPendingHomework();
    } else if (status) {
      // Filter by status if provided
      const allAssignments = await storage.getAllHomeworkAssignments();
      assignments = allAssignments.filter(assignment => assignment.status === status);
    } else {
      // Return all homework assignments by default
      assignments = await storage.getAllHomeworkAssignments();
    }
    
    // Get student and staff info for each assignment
    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const student = assignment.studentId ? await storage.getStudent(assignment.studentId) : undefined;
        const activity = assignment.activityId ? await storage.getActivity(assignment.activityId) : undefined;
        const staff = assignment.assignedByStaffId ? await storage.getStaff(assignment.assignedByStaffId) : undefined;
        const verifier = assignment.verifiedByStaffId ? await storage.getStaff(assignment.verifiedByStaffId) : undefined;
        
        let staffInfo = undefined;
        if (staff && staff.userId) {
          const staffUser = await storage.getUser(staff.userId);
          if (staffUser) {
            staffInfo = {
              id: staff.id,
              name: staffUser.fullName,
              title: staff.title,
              profileImageUrl: staffUser.profileImageUrl
            };
          }
        }
        
        let verifierInfo = undefined;
        if (verifier && verifier.userId) {
          const verifierUser = await storage.getUser(verifier.userId);
          if (verifierUser) {
            verifierInfo = {
              id: verifier.id,
              name: verifierUser.fullName,
              title: verifier.title,
              profileImageUrl: verifierUser.profileImageUrl
            };
          }
        }
        
        return {
          ...assignment,
          student: student ? {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            grade: student.grade,
            profileImageUrl: student.profileImageUrl
          } : undefined,
          activity: activity ? {
            id: activity.id,
            name: activity.name,
            type: activity.activityType
          } : undefined,
          assignedBy: staffInfo,
          verifiedBy: verifierInfo
        };
      })
    );
    
    res.json(assignmentsWithDetails);
  });
  
  app.get("/api/homework/:id", hasRole(['staff', 'admin', 'parent', 'student']), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid homework assignment ID" });
    }
    
    const assignment = await storage.getHomeworkAssignment(id);
    if (!assignment) {
      return res.status(404).json({ message: "Homework assignment not found" });
    }
    
    const student = assignment.studentId ? await storage.getStudent(assignment.studentId) : undefined;
    const activity = assignment.activityId ? await storage.getActivity(assignment.activityId) : undefined;
    const staff = assignment.assignedByStaffId ? await storage.getStaff(assignment.assignedByStaffId) : undefined;
    const verifier = assignment.verifiedByStaffId ? await storage.getStaff(assignment.verifiedByStaffId) : undefined;
    
    let staffInfo = undefined;
    if (staff && staff.userId) {
      const staffUser = await storage.getUser(staff.userId);
      if (staffUser) {
        staffInfo = {
          id: staff.id,
          name: staffUser.fullName,
          title: staff.title,
          profileImageUrl: staffUser.profileImageUrl
        };
      }
    }
    
    let verifierInfo = undefined;
    if (verifier && verifier.userId) {
      const verifierUser = await storage.getUser(verifier.userId);
      if (verifierUser) {
        verifierInfo = {
          id: verifier.id,
          name: verifierUser.fullName,
          title: verifier.title,
          profileImageUrl: verifierUser.profileImageUrl
        };
      }
    }
    
    res.json({
      ...assignment,
      student: student ? {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        profileImageUrl: student.profileImageUrl
      } : undefined,
      activity: activity ? {
        id: activity.id,
        name: activity.name,
        type: activity.activityType
      } : undefined,
      assignedBy: staffInfo,
      verifiedBy: verifierInfo
    });
  });
  
  app.post("/api/homework", hasRole('staff'), async (req, res) => {
    try {
      const homeworkData = insertHomeworkAssignmentSchema.parse(req.body);
      const assignment = await storage.createHomeworkAssignment(homeworkData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid homework assignment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create homework assignment" });
      }
    }
  });
  
  app.patch("/api/homework/:id/update-status", hasRole(['parent', 'student', 'staff']), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid homework assignment ID" });
    }
    
    const { status, completedDate, completionNotes } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    try {
      const updatedAssignment = await storage.updateHomeworkStatus(id, status, completedDate, completionNotes);
      res.json(updatedAssignment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update homework status" });
    }
  });
  
  app.patch("/api/homework/:id/verify", hasRole('staff'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid homework assignment ID" });
    }
    
    const { staffId } = req.body;
    if (!staffId) {
      return res.status(400).json({ message: "Staff ID is required" });
    }
    
    try {
      const updatedAssignment = await storage.verifyHomeworkCompletion(id, parseInt(staffId));
      res.json(updatedAssignment);
    } catch (error) {
      res.status(500).json({ message: "Failed to verify homework completion" });
    }
  });
  
  app.patch("/api/homework/:id/notify-parent", hasPermission('parent-notifications'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid homework assignment ID" });
    }
    
    try {
      const updatedAssignment = await storage.notifyParentAboutHomework(id);
      res.json(updatedAssignment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update parent notification status" });
    }
  });

  // Parent dashboard data endpoint
  app.get("/api/parent/dashboard", hasRole('parent'), async (req, res) => {
    try {
      const user = req.user as any;
      const parentId = user.id;
      
      // Get children info
      const children = await storage.getStudentsByParentId(parentId);
      
      if (!children.length) {
        return res.json({
          children: [],
          recentHomework: [],
          unreadNotes: [],
          recentIncidents: []
        });
      }
      
      // Get recent homework assignments
      const childrenIds = children.map(child => child.id);
      
      // Store all homework assignments
      let allHomework: HomeworkAssignment[] = [];
      for (const childId of childrenIds) {
        const homework = await storage.getHomeworkByStudent(childId);
        allHomework = [...allHomework, ...homework];
      }
      
      // Sort by due date and take only the 5 most recent
      const recentHomework = allHomework
        .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
        .slice(0, 5);
      
      // Enhance homework with additional data
      const homeworkWithDetails = await Promise.all(
        recentHomework.map(async (hw) => {
          const student = await storage.getStudent(hw.studentId);
          const activity = await storage.getActivity(hw.activityId);
          const assignedBy = await storage.getStaff(hw.assignedByStaffId);
          const assignedByUser = assignedBy?.userId ? await storage.getUser(assignedBy.userId) : null;
          
          let verifiedBy = null;
          if (hw.verifiedByStaffId) {
            const verifier = await storage.getStaff(hw.verifiedByStaffId);
            const verifierUser = verifier?.userId ? await storage.getUser(verifier.userId) : null;
            
            if (verifier && verifierUser) {
              verifiedBy = {
                id: verifier.id,
                firstName: verifierUser.fullName.split(' ')[0],
                lastName: verifierUser.fullName.split(' ').slice(1).join(' '),
                title: verifier.title,
                profileImageUrl: verifierUser.profileImageUrl
              };
            }
          }
          
          return {
            ...hw,
            student: student ? {
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              grade: student.grade,
              profileImageUrl: student.profileImageUrl
            } : null,
            activity: activity ? {
              id: activity.id,
              name: activity.name,
              type: activity.activityType
            } : null,
            assignedBy: assignedBy && assignedByUser ? {
              id: assignedBy.id,
              firstName: assignedByUser.fullName.split(' ')[0],
              lastName: assignedByUser.fullName.split(' ').slice(1).join(' '),
              title: assignedBy.title,
              profileImageUrl: assignedByUser.profileImageUrl
            } : null,
            verifiedBy
          };
        })
      );
      
      // Get unread behavior notes
      let unreadNotes: BehaviorNote[] = [];
      for (const childId of childrenIds) {
        const notes = await storage.getParentVisibleNotes(childId);
        // Filter for notes that haven't been read
        const unread = notes.filter(note => !note.parentRead);
        unreadNotes = [...unreadNotes, ...unread];
      }
      
      // Enhance notes with student and staff info
      const notesWithDetails = await Promise.all(
        unreadNotes.map(async (note) => {
          const student = await storage.getStudent(note.studentId);
          const staffMember = await storage.getStaff(note.staffId);
          const staffUser = staffMember?.userId ? await storage.getUser(staffMember.userId) : null;
          
          return {
            ...note,
            student: student ? {
              id: student.id,
              name: `${student.firstName} ${student.lastName}`,
              grade: student.grade,
              profileImageUrl: student.profileImageUrl
            } : null,
            staff: staffMember && staffUser ? {
              id: staffMember.id,
              name: staffUser.fullName,
              title: staffMember.title,
              profileImageUrl: staffUser.profileImageUrl
            } : null
          };
        })
      );
      
      // Get recent behavior incidents
      let recentIncidents: BehaviorIncident[] = [];
      for (const childId of childrenIds) {
        const incidents = await storage.getIncidentsByStudent(childId);
        // Filter for incidents where parent has been notified
        const notifiedIncidents = incidents.filter(incident => incident.parentNotified);
        recentIncidents = [...recentIncidents, ...notifiedIncidents];
      }
      
      // Sort by date and take only the 5 most recent
      recentIncidents = recentIncidents
        .sort((a, b) => new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime())
        .slice(0, 5);
      
      // Enhance incidents with student and reporter info
      const incidentsWithDetails = await Promise.all(
        recentIncidents.map(async (incident) => {
          const student = await storage.getStudent(incident.studentId);
          const reporter = incident.reportedByStaffId ? await storage.getStaff(incident.reportedByStaffId) : null;
          const reporterUser = reporter?.userId ? await storage.getUser(reporter.userId) : null;
          
          return {
            ...incident,
            student: student ? {
              id: student.id,
              name: `${student.firstName} ${student.lastName}`,
              grade: student.grade,
              profileImageUrl: student.profileImageUrl
            } : null,
            reporter: reporter && reporterUser ? {
              id: reporter.id,
              name: reporterUser.fullName,
              title: reporter.title,
              profileImageUrl: reporterUser.profileImageUrl
            } : null
          };
        })
      );
      
      // Construct full dashboard data
      const dashboardData = {
        children: children.map(child => ({
          id: child.id,
          name: `${child.firstName} ${child.lastName}`,
          grade: child.grade,
          profileImageUrl: child.profileImageUrl,
          behaviorTier: child.currentTier
        })),
        recentHomework: homeworkWithDetails,
        unreadNotes: notesWithDetails,
        recentIncidents: incidentsWithDetails
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Error getting parent dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch parent dashboard data" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket for real-time updates on a different path to avoid conflicts with Vite
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws' // Custom path for our WebSocket server
  });
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Elevo Central real-time updates'
    }));
    
    // Handle messages from client
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received:', data);
        
        // Handle different message types
        if (data.type === 'subscribe') {
          // Subscribe to updates for specific entity
          ws.entityId = data.entityId;
          ws.entityType = data.entityType;
          console.log(`Client subscribed to ${data.entityType} updates for ID: ${data.entityId}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
  
  // Helper function to broadcast updates to relevant clients
  global.broadcastUpdate = (entityType, entityId, data) => {
    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN && 
        (client.entityType === entityType && client.entityId === entityId)
      ) {
        client.send(JSON.stringify({
          type: 'update',
          entityType,
          entityId,
          data
        }));
      }
    });
  };

  return httpServer;
}
