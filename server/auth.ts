import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { User } from '../shared/schema';
import { storage } from './storage';

// Configure Passport.js local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log(`[LOGIN] Attempting login for username: ${username}`);
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      
      // If user doesn't exist
      if (!user) {
        console.log(`[LOGIN] User not found: ${username}`);
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      console.log(`[LOGIN] User found: ${username}, comparing passwords`);
      
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      
      console.log(`[LOGIN] Password match result: ${isMatch}`);
      
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      // If credentials are valid, return the user
      console.log(`[LOGIN] Authentication successful for: ${username}`);
      return done(null, user);
    } catch (error) {
      console.error(`[LOGIN] Error during authentication:`, error);
      return done(error);
    }
  })
);

// Type definition for the Express session
declare module 'express-session' {
  interface SessionData {
    passport: {
      user: number;
    };
  }
}

// Type definition for the Express request
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User {
      id: number;
      username: string;
      password: string;
      fullName: string;
      role: string;
      profileImageUrl?: string | null;
    }
  }
}

// Serialize user to the session
passport.serializeUser<any>((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser<number>(async (id, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, undefined);
  }
});

// Permission-based authorization middleware
export const hasPermission = (requiredPermission: string, allowPublic: boolean = false) => {
  return async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      // If this endpoint allows public access, continue
      if (allowPublic) {
        return next();
      }
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user: User = req.user;
    
    // Check if user is an admin (admins have all permissions)
    if (user.role === 'admin') {
      return next();
    }
    
    // For staff users, check specific permissions
    if (user.role === 'staff') {
      try {
        const staffMember = await storage.getStaffByUserId(user.id);
        
        if (!staffMember) {
          return res.status(403).json({ message: 'Staff record not found' });
        }
        
        // If staff has the required permission
        if (staffMember.permissions && staffMember.permissions.includes(requiredPermission as any)) {
          return next();
        }
        
        // Role-based default permissions
        if (staffMember.staffRole === 'site-manager') {
          // Site managers have access to everything per their operational oversight role
          // This includes staff supervision, program implementation, safety compliance,
          // communications, inventory and logistics management
          return next();
        }
        
        if (staffMember.staffRole === 'youth-development-lead') {
          // Youth Development Leads have access to specific permissions related to
          // operational oversight, staff supervision, safety compliance, program coordination,
          // communication, reporting, inventory management
          const youthDevLeadPermissions = [
            // Inventory management
            'snack-inventory',
            'soccer-jersey-inventory',
            'practice-jersey-inventory',
            'equipment-inventory',
            'supplies-inventory',
            
            // Program management
            'homework-management',
            'behavior-management',
            'attendance-tracking',
            'student-records',
            
            // Reporting
            'daily-reports',
            'incident-reports',
            
            // Communication
            'parent-notifications',
            'staff-communications'
          ];
          
          if (youthDevLeadPermissions.includes(requiredPermission)) {
            return next();
          }
        }
        
        if (staffMember.staffRole === 'coach') {
          // Coaches have access to homework management, attendance tracking,
          // and basic inventory management
          const coachPermissions = [
            'homework-management',
            'supplies-inventory',
            'attendance-tracking',
            'behavior-notes',
            'student-feedback'
          ];
          
          if (coachPermissions.includes(requiredPermission)) {
            return next();
          }
        }
        
        if (staffMember.staffRole === 'second-in-command') {
          // Second in Command has similar permissions to Site Manager but with focus on
          // specific operational areas like supper distribution
          const secondInCommandPermissions = [
            // All inventory management 
            'snack-inventory',
            'soccer-jersey-inventory',
            'practice-jersey-inventory',
            'equipment-inventory',
            'supplies-inventory',
            
            // Supper/meal distribution tracking
            'meal-distribution',
            'meal-inventory',
            
            // Staff supervision
            'staff-scheduling',
            'staff-attendance',
            
            // Program management
            'homework-management',
            'behavior-management',
            'attendance-tracking'
          ];
          
          if (secondInCommandPermissions.includes(requiredPermission)) {
            return next();
          }
        }
      } catch (error) {
        console.error('Error checking staff permissions:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
    
    // For parent users, only allow parent-specific permissions
    if (user.role === 'parent') {
      const parentPermissions = [
        // View child data
        'view-child-info',
        'view-child-attendance',
        'view-child-behavior',
        'view-child-homework',
        
        // Request functionality
        'early-release-request',
        'absence-notification',
        'contact-staff',
        
        // Homework-related
        'mark-homework-completed',
        'view-homework-assignments',
        
        // Behavior and communication
        'view-behavior-notes',
        'mark-note-read',
        'view-announcements'
      ];
      
      if (parentPermissions.includes(requiredPermission)) {
        return next();
      }
    }
    
    // If we get here, the user doesn't have permission
    return res.status(403).json({ message: 'Access denied' });
  };
};

// Role-based authorization middleware
export const hasRole = (requiredRole: string | string[], allowPublic: boolean = false) => {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      // If this endpoint allows public access, continue
      if (allowPublic) {
        return next();
      }
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user: User = req.user;
    
    // Admin always has access
    if (user.role === 'admin') {
      return next();
    }
    
    // Check if the user has one of the required roles
    if (Array.isArray(requiredRole)) {
      if (requiredRole.includes(user.role)) {
        return next();
      }
    } else {
      // Check for a single required role
      if (user.role === requiredRole) {
        return next();
      }
    }
    
    return res.status(403).json({ message: 'Access denied' });
  };
};

// Helper function for hashing passwords
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export default passport;