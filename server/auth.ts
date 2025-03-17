import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { User } from '../shared/schema';
import { storage } from './storage';

// Configure Passport.js local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find user by username
      const user = await storage.getUserByUsername(username);
      
      // If user doesn't exist
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      // If credentials are valid, return the user
      return done(null, user);
    } catch (error) {
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
export const hasPermission = (requiredPermission: string) => {
  return async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
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
          // Site managers have access to everything
          return next();
        }
        
        if (staffMember.staffRole === 'youth-development-lead') {
          // Youth development leads have access to specific permissions
          const youthDevLeadPermissions = [
            'snack-inventory',
            'soccer-jersey-inventory',
            'practice-jersey-inventory',
            'homework-management',
            'behavior-management'
          ];
          
          if (youthDevLeadPermissions.includes(requiredPermission)) {
            return next();
          }
        }
        
        if (staffMember.staffRole === 'coach') {
          // Coaches have access to homework management and supplies
          const coachPermissions = [
            'homework-management',
            'supplies-inventory'
          ];
          
          if (coachPermissions.includes(requiredPermission)) {
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
        'view-child-info',
        'early-release-request'
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
export const hasRole = (requiredRole: string | string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
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