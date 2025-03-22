import { db } from './db';
import { users, staff, students } from '../shared/schema';
import { hashPassword } from './auth';

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  // Create admin user
  const adminPassword = await hashPassword('password');
  const [adminUser] = await db.insert(users).values({
    username: 'admin',
    password: adminPassword,
    fullName: 'Admin User',
    role: 'admin',
    profileImageUrl: null
  }).returning();
  
  console.log('Created admin user:', adminUser);
  
  // Create staff user
  const staffPassword = await hashPassword('password');
  const [staffUser] = await db.insert(users).values({
    username: 'staff1',
    password: staffPassword,
    fullName: 'Staff Member',
    role: 'staff',
    profileImageUrl: null
  }).returning();
  
  console.log('Created staff user:', staffUser);
  
  // Create staff profile
  const [staffProfile] = await db.insert(staff).values({
    userId: staffUser.id,
    firstName: 'Staff',
    lastName: 'Member',
    title: 'Program Coordinator',
    email: 'staff@example.com',
    phone: '555-123-4567',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active',
    role: 'coach',
    bio: 'Experienced program coordinator specializing in after-school activities',
    emergencyContact: 'Emergency Contact: 555-999-8888',
    specialSkills: 'Sports coaching, art instruction',
    certifications: 'First Aid, CPR',
    profileImageUrl: null
  }).returning();
  
  console.log('Created staff profile:', staffProfile);
  
  // Create parent user
  const parentPassword = await hashPassword('password');
  const [parentUser] = await db.insert(users).values({
    username: 'parent1',
    password: parentPassword,
    fullName: 'Parent User',
    role: 'parent',
    profileImageUrl: null
  }).returning();
  
  console.log('Created parent user:', parentUser);
  
  // Create student records for the parent
  const [student1] = await db.insert(students).values({
    firstName: 'Student',
    lastName: 'One',
    grade: '3',
    enrollmentDate: new Date().toISOString().split('T')[0],
    emergencyContact: 'Parent: 555-888-7777',
    allergies: 'None',
    parentId: parentUser.id,
    currentTier: 'green',
    dismissalTime: 'regular',
    profileImageUrl: null
  }).returning();
  
  console.log('Created student record:', student1);
  
  console.log('Database seeding completed successfully');
}

seedDatabase().catch(console.error);