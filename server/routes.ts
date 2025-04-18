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
import path from 'path';
import fs from 'fs';
import { importAttendanceData } from './utils/excel-import';
import multer from 'multer';

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
    
    // Get student and reporter info
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
  
  app.post("/api/behavior-incidents", hasPermission('behavior-management'), async (req, res) => {
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
  
  app.patch("/api/behavior-incidents/:id/resolve", hasRole('staff'), async (req, res) => {
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
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const updatedIncident = await storage.setParentNotified(id, today);
      res.json(updatedIncident);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark parent as notified" });
    }
  });
  
  // Behavior Notes routes
  app.get("/api/behavior-notes", hasPermission('behavior-management'), async (req, res) => {
    const { studentId, limit } = req.query;
    
    let notes;
    if (studentId) {
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
  
  app.get("/api/behavior-notes/parent-visible", hasRole('parent'), async (req, res) => {
    // Get the parent's ID from the authenticated user
    const parentId = (req.user as any).id;
    
    // Get the parent's children
    const children = await storage.getStudentsByParentId(parentId);
    
    // If no children, return empty array
    if (!children || children.length === 0) {
      return res.json([]);
    }
    
    // Get notes for each child that are parent-visible
    const allNotes: BehaviorNote[] = [];
    for (const child of children) {
      const notes = await storage.getParentVisibleNotes(child.id);
      allNotes.push(...notes);
    }
    
    // Get student and staff info for each note
    const notesWithDetails = await Promise.all(
      allNotes.map(async (note) => {
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
  
  app.get("/api/behavior-notes/:id", hasPermission('behavior-management'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }
    
    const note = await storage.getBehaviorNote(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    // Get student and staff info
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
    
    res.json({
      ...note,
      student: student ? {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        profileImageUrl: student.profileImageUrl
      } : undefined,
      staff: staffInfo
    });
  });
  
  app.post("/api/behavior-notes", hasRole('staff'), async (req, res) => {
    try {
      const noteData = insertBehaviorNoteSchema.parse(req.body);
      const note = await storage.createBehaviorNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid note data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create note" });
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
  
  app.get("/api/tier-transitions/:id", hasPermission('behavior-management'), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid transition ID" });
    }
    
    const transition = await storage.getTierTransition(id);
    if (!transition) {
      return res.status(404).json({ message: "Transition not found" });
    }
    
    // Get student and authorizer info
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
    
    res.json({
      ...transition,
      student: student ? {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        profileImageUrl: student.profileImageUrl
      } : undefined,
      authorizedBy: authorizerInfo
    });
  });
  
  app.post("/api/tier-transitions", hasRole(['admin', 'site-manager', 'youth-development-lead']), async (req, res) => {
    try {
      const transitionData = insertTierTransitionSchema.parse(req.body);
      const transition = await storage.createTierTransition(transitionData);
      
      // Update the student's current tier
      await storage.updateStudentTier(transitionData.studentId, transitionData.toTier, transitionData.date);
      
      res.status(201).json(transition);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transition data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create transition" });
      }
    }
  });
  
  // Homework routes
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
    } else {
      // Return all homework assignments by default
      assignments = await storage.getAllHomeworkAssignments();
    }
    
    // Get student, activity, and staff info for each assignment
    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const student = assignment.studentId ? await storage.getStudent(assignment.studentId) : null;
        const activity = assignment.activityId ? await storage.getActivity(assignment.activityId) : null;
        const assignedBy = assignment.assignedByStaffId ? await storage.getStaff(assignment.assignedByStaffId) : null;
        const verifiedBy = assignment.verifiedByStaffId ? await storage.getStaff(assignment.verifiedByStaffId) : null;
        
        let assignedByInfo = null;
        if (assignedBy && assignedBy.userId) {
          const assignedByUser = await storage.getUser(assignedBy.userId);
          if (assignedByUser) {
            assignedByInfo = {
              id: assignedBy.id,
              firstName: assignedByUser.fullName.split(' ')[0],
              lastName: assignedByUser.fullName.split(' ').slice(1).join(' '),
              title: assignedBy.title,
              profileImageUrl: assignedByUser.profileImageUrl
            };
          }
        }
        
        let verifiedByInfo = null;
        if (verifiedBy && verifiedBy.userId) {
          const verifiedByUser = await storage.getUser(verifiedBy.userId);
          if (verifiedByUser) {
            verifiedByInfo = {
              id: verifiedBy.id,
              firstName: verifiedByUser.fullName.split(' ')[0],
              lastName: verifiedByUser.fullName.split(' ').slice(1).join(' '),
              title: verifiedBy.title,
              profileImageUrl: verifiedByUser.profileImageUrl
            };
          }
        }
        
        return {
          ...assignment,
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
          assignedBy: assignedByInfo,
          verifiedBy: verifiedByInfo
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
    
    // Get student, activity, and staff info
    const student = assignment.studentId ? await storage.getStudent(assignment.studentId) : null;
    const activity = assignment.activityId ? await storage.getActivity(assignment.activityId) : null;
    const assignedBy = assignment.assignedByStaffId ? await storage.getStaff(assignment.assignedByStaffId) : null;
    const verifiedBy = assignment.verifiedByStaffId ? await storage.getStaff(assignment.verifiedByStaffId) : null;
    
    let assignedByInfo = null;
    if (assignedBy && assignedBy.userId) {
      const assignedByUser = await storage.getUser(assignedBy.userId);
      if (assignedByUser) {
        assignedByInfo = {
          id: assignedBy.id,
          firstName: assignedByUser.fullName.split(' ')[0],
          lastName: assignedByUser.fullName.split(' ').slice(1).join(' '),
          title: assignedBy.title,
          profileImageUrl: assignedByUser.profileImageUrl
        };
      }
    }
    
    let verifiedByInfo = null;
    if (verifiedBy && verifiedBy.userId) {
      const verifiedByUser = await storage.getUser(verifiedBy.userId);
      if (verifiedByUser) {
        verifiedByInfo = {
          id: verifiedBy.id,
          firstName: verifiedByUser.fullName.split(' ')[0],
          lastName: verifiedByUser.fullName.split(' ').slice(1).join(' '),
          title: verifiedBy.title,
          profileImageUrl: verifiedByUser.profileImageUrl
        };
      }
    }
    
    res.json({
      ...assignment,
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
      assignedBy: assignedByInfo,
      verifiedBy: verifiedByInfo
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
    
    try {
      const updatedAssignment = await storage.updateHomeworkStatus(
        id, 
        status,
        completedDate,
        completionNotes
      );
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
    
    const staffId = parseInt(req.body.staffId);
    if (isNaN(staffId)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }
    
    try {
      const updatedAssignment = await storage.verifyHomeworkCompletion(id, staffId);
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
      res.status(500).json({ message: "Failed to mark parent as notified" });
    }
  });
  
  // Parent dashboard data
  app.get("/api/parent-dashboard", hasRole('parent'), async (req, res) => {
    try {
      // Get the parent's ID from the authenticated user
      const parentId = (req.user as any).id;
      
      // Get the parent's children
      const children = await storage.getStudentsByParentId(parentId);
      
      if (!children || children.length === 0) {
        return res.json({
          children: [],
          recentHomework: [],
          unreadNotes: [],
          recentIncidents: [],
          dailySchedule: null
        });
      }
      
      // Format children data
      const formattedChildren = children.map(child => ({
        id: child.id,
        name: `${child.firstName} ${child.lastName}`,
        grade: child.grade,
        profileImageUrl: child.profileImageUrl,
        behaviorTier: child.currentTier,
        dismissalTime: child.dismissalTime
      }));
      
      // Get behavior incidents data
      let allIncidents: BehaviorIncident[] = [];
      for (const child of children) {
        const incidents = await storage.getIncidentsByStudent(child.id);
        const recentIncidents = incidents
          .filter(incident => incident.parentNotified) // Only include incidents where parent was notified
          .sort((a, b) => {
            // Sort by date and time, most recent first
            const dateA = new Date(`${a.incidentDate}T${a.incidentTime}`);
            const dateB = new Date(`${b.incidentDate}T${b.incidentTime}`);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5); // Get the 5 most recent
        
        allIncidents = [...allIncidents, ...recentIncidents];
      }
      
      // Get unread behavior notes
      let allUnreadNotes: BehaviorNote[] = [];
      for (const child of children) {
        const notes = await storage.getParentVisibleNotes(child.id);
        const unreadNotes = notes.filter(note => !note.parentRead);
        allUnreadNotes = [...allUnreadNotes, ...unreadNotes];
      }
      
      // Get recent homework assignments
      let allHomework: HomeworkAssignment[] = [];
      for (const childId of children.map(c => c.id)) {
        const homework = await storage.getHomeworkByStudent(childId);
        allHomework = [...allHomework, ...homework];
      }
      
      // Sort by due date (most recent first) and take only the 5 most recent
      const recentHomework = allHomework
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
        .slice(0, 5);
      
      // Enhance homework with additional data
      const homeworkWithDetails = await Promise.all(
        recentHomework.map(async (assignment) => {
          const student = assignment.studentId ? await storage.getStudent(assignment.studentId) : null;
          const activity = assignment.activityId ? await storage.getActivity(assignment.activityId) : null;
          const assignedBy = assignment.assignedByStaffId ? await storage.getStaff(assignment.assignedByStaffId) : null;
          
          let assignedByInfo = null;
          if (assignedBy && assignedBy.userId) {
            const assignedByUser = await storage.getUser(assignedBy.userId);
            if (assignedByUser) {
              assignedByInfo = {
                id: assignedBy.id,
                firstName: assignedByUser.fullName.split(' ')[0],
                lastName: assignedByUser.fullName.split(' ').slice(1).join(' '),
                title: assignedBy.title,
                profileImageUrl: assignedByUser.profileImageUrl
              };
            }
          }
          
          return {
            ...assignment,
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
            assignedBy: assignedByInfo
          };
        })
      );
      
      // Enhance behavior notes with additional data
      const notesWithDetails = await Promise.all(
        allUnreadNotes.map(async (note) => {
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
      
      // Enhance incidents with additional data
      const incidentsWithDetails = await Promise.all(
        allIncidents.map(async (incident) => {
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
      
      // Hardcoded daily schedule for now, this would come from a settings table in the future
      const dailySchedule = {
        regularDay: {
          checkIn: {
            kindergarten: "8:00 AM",
            regular: "8:15 AM"
          },
          periods: [
            {
              time: "8:30 AM - 9:30 AM",
              activities: [
                { grade: "K-2", activity: "Homework Help" },
                { grade: "3-5", activity: "Reading Club" }
              ]
            },
            {
              time: "9:45 AM - 10:45 AM",
              activities: [
                { grade: "K-2", activity: "Arts & Crafts" },
                { grade: "3-5", activity: "STEM Activities" }
              ]
            },
            {
              time: "11:00 AM - 12:00 PM",
              activities: [
                { grade: "K-2", activity: "Outdoor Play" },
                { grade: "3-5", activity: "Sports" }
              ]
            }
          ],
          dismissalTimes: [
            { time: "4:30 PM", type: "Early" },
            { time: "5:00 PM", type: "Regular" },
            { time: "5:30 PM", type: "Extended" },
            { time: "6:00 PM", type: "Late" }
          ]
        }
      };
      
      res.json({
        children: formattedChildren,
        recentHomework: homeworkWithDetails,
        unreadNotes: notesWithDetails,
        recentIncidents: incidentsWithDetails,
        dailySchedule
      });
    } catch (error) {
      console.error('Error fetching parent dashboard data:', error);
      res.status(500).json({
        message: 'Error fetching parent dashboard data',
        success: false
      });
    }
  });
  
  // Add a simple route for handling Excel file uploading and roster imports
  
  // Set up storage for uploaded files
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadsDir = path.join(__dirname, 'uploads');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      // Create a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
  
  // Handle roster data import from Excel file
  app.post('/api/roster/import', hasRole(['admin', 'site-manager', 'youth-development-lead']), upload.single('rosterFile'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    try {
      const result = await importAttendanceData(req.file.path);
      
      // Clean up the file after import
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        message: 'Roster imported successfully',
        result
      });
    } catch (error) {
      console.error('Error importing roster:', error);
      res.status(500).json({
        success: false,
        message: `Error fetching roster data: ${error.message || 'Unknown error'}`,
      });
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
    console.log('WebSocket client connected');
    
    // Handle messages from client
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle subscription requests
        if (data.type === 'subscribe') {
          ws.entityType = data.entityType;
          ws.entityId = data.entityId;
          console.log(`Client subscribed to ${data.entityType} with ID: ${data.entityId}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
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