import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertActivitySchema, 
  insertAnnouncementSchema, 
  insertStaffSchema, 
  insertStaffActivitySchema, 
  insertUserSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - prefix all routes with /api
  
  // Users routes
  app.get("/api/users", async (req, res) => {
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
  
  app.post("/api/users", async (req, res) => {
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
  app.get("/api/staff", async (req, res) => {
    const { active } = req.query;
    const staff = active === "true" 
      ? await storage.getActiveStaff() 
      : await storage.getAllStaff();
    res.json(staff);
  });
  
  app.get("/api/staff/:id", async (req, res) => {
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
  
  app.post("/api/staff", async (req, res) => {
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
  app.get("/api/activities", async (req, res) => {
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
  
  app.get("/api/activities/:id", async (req, res) => {
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
  
  app.post("/api/activities", async (req, res) => {
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
  app.post("/api/staff-activities", async (req, res) => {
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
  
  app.get("/api/staff/:id/activities", async (req, res) => {
    const staffId = parseInt(req.params.id);
    if (isNaN(staffId)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }
    
    const activities = await storage.getActivitiesForStaff(staffId);
    res.json(activities);
  });
  
  app.get("/api/activities/:id/staff", async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }
    
    const staff = await storage.getStaffForActivity(activityId);
    res.json(staff);
  });
  
  // Announcements routes
  app.get("/api/announcements", async (req, res) => {
    const { limit } = req.query;
    
    let announcements;
    if (limit) {
      announcements = await storage.getRecentAnnouncements(parseInt(limit as string));
    } else {
      announcements = await storage.getAllAnnouncements();
    }
    
    const announcementsWithAuthor = await Promise.all(
      announcements.map(async (announcement) => {
        const author = await storage.getUser(announcement.authorId);
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
  
  app.get("/api/announcements/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid announcement ID" });
    }
    
    const announcement = await storage.getAnnouncement(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    
    const author = await storage.getUser(announcement.authorId);
    
    res.json({
      ...announcement,
      author: author ? {
        id: author.id,
        fullName: author.fullName,
        profileImageUrl: author.profileImageUrl
      } : undefined
    });
  });
  
  app.post("/api/announcements", async (req, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(announcementData);
      
      const author = await storage.getUser(announcement.authorId);
      
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
  
  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    
    const activities = await storage.getActivitiesByDate(date);
    const staff = await storage.getActiveStaff();
    const announcements = await storage.getRecentAnnouncements(3);
    
    // Calculate total students across all activities for today
    const studentCount = activities.reduce((total, activity) => total + activity.studentCount, 0);
    
    res.json({
      studentCount,
      activitiesCount: activities.length,
      staffCount: staff.length,
      announcementsCount: announcements.length
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
