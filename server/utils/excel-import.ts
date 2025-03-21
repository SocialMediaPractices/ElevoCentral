import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { storage } from '../storage';
import { InsertStudent, Student } from '../../shared/schema';

/**
 * Utility to import attendance data from Excel file and update rosters
 */
export async function importAttendanceData(filePath: string): Promise<{
  success: boolean;
  message: string;
  studentsImported?: Student[];
  errors?: string[];
}> {
  try {
    const resolvedPath = path.resolve(filePath);
    
    if (!fs.existsSync(resolvedPath)) {
      return {
        success: false,
        message: `File not found: ${resolvedPath}`,
      };
    }
    
    // Read the Excel file
    const workbook = XLSX.readFile(resolvedPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'No data found in the Excel file',
      };
    }
    
    console.log('Excel data parsed:', data.slice(0, 2)); // Log first 2 entries for debugging
    
    // Process each row and create/update students
    const errors: string[] = [];
    const studentsImported: Student[] = [];
    
    for (const row of data) {
      try {
        // Map Excel columns to student properties
        // Adjust these field mappings based on your actual Excel structure
        const studentData: InsertStudent = {
          firstName: row['First Name'] || row['FirstName'] || '',
          lastName: row['Last Name'] || row['LastName'] || '',
          grade: row['Grade'] || row['GradeLevel'] || '',
          parentId: null, // Will need to assign parent later
          behaviorTier: 'green', // Default tier
          dismissalTime: row['Dismissal Time'] || row['DismissalTime'] || '3:30pm',
          specialNeeds: row['Special Needs'] || row['SpecialNeeds'] || '',
          allergies: row['Allergies'] || '',
          profileImageUrl: null,
          emergencyContactName: row['Emergency Contact'] || row['EmergencyContact'] || '',
          emergencyContactPhone: row['Emergency Phone'] || row['EmergencyPhone'] || '',
        };
        
        // Skip if missing essential information
        if (!studentData.firstName || !studentData.lastName) {
          errors.push(`Row missing essential data: ${JSON.stringify(row)}`);
          continue;
        }
        
        // Check if student already exists (by first name, last name, and grade)
        const existingStudents = await storage.getAllStudents();
        const existingStudent = existingStudents.find(
          s => s.firstName.toLowerCase() === studentData.firstName.toLowerCase() &&
               s.lastName.toLowerCase() === studentData.lastName.toLowerCase() &&
               s.grade === studentData.grade
        );
        
        let student: Student;
        
        if (existingStudent) {
          // Logic for updating existing student if needed
          // For now, we'll just use the existing one
          student = existingStudent;
        } else {
          // Create new student
          student = await storage.createStudent(studentData);
          console.log(`Created new student: ${student.firstName} ${student.lastName}`);
        }
        
        studentsImported.push(student);
      } catch (rowError) {
        errors.push(`Error processing row ${JSON.stringify(row)}: ${rowError}`);
      }
    }
    
    return {
      success: true,
      message: `Successfully processed ${studentsImported.length} students with ${errors.length} errors`,
      studentsImported,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Error importing Excel data:', error);
    return {
      success: false,
      message: `Error importing Excel data: ${error.message}`,
    };
  }
}