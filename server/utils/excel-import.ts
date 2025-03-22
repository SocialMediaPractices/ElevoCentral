import { InsertStudent, Student } from "@shared/schema";
import { storage } from "../storage";
import { read, utils } from "xlsx";

/**
 * Utility to import attendance data from Excel file and update rosters
 */
export async function importAttendanceData(filePath: string): Promise<{
  imported: number;
  errors: string[];
  students: Student[];
}> {
  try {
    // Read the Excel file
    const workbook = read(filePath, { type: "file" });
    
    // Assume the first sheet contains the data
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const rows = utils.sheet_to_json(worksheet);
    
    const importedStudents: Student[] = [];
    const errors: string[] = [];
    
    // Process each row
    for (const row of rows) {
      try {
        // Map Excel columns to student fields
        // These field names should match the Excel headers
        // Adjust as needed based on your actual Excel structure
        const firstName = row["First Name"] || row["FirstName"] || "";
        const lastName = row["Last Name"] || row["LastName"] || "";
        const grade = row["Grade"] || "";
        const parentEmail = row["Parent Email"] || row["ParentEmail"] || "";
        const emergencyContact = row["Emergency Contact"] || row["EmergencyContact"] || "";
        const allergies = row["Allergies"] || "";
        const dismissalTime = row["Dismissal Time"] || row["DismissalTime"] || "regular";
        
        if (!firstName || !lastName) {
          errors.push(`Missing required fields for student: ${JSON.stringify(row)}`);
          continue;
        }
        
        // Check if this student already exists by matching first and last name
        const existingStudents = await storage.getAllStudents();
        const existingStudent = existingStudents.find(
          (s) => s.firstName.toLowerCase() === firstName.toLowerCase() && 
                s.lastName.toLowerCase() === lastName.toLowerCase()
        );
        
        if (existingStudent) {
          // Update existing student (would need additional storage methods)
          // For now, just log and skip
          errors.push(`Student already exists: ${firstName} ${lastName}`);
          continue;
        }
        
        // Create new student record
        const studentData: InsertStudent = {
          firstName,
          lastName,
          grade: String(grade),
          enrollmentDate: new Date().toISOString().split("T")[0],
          emergencyContact,
          allergies,
          parentId: null, // Would need to look up or create parent
          currentTier: "green", // Default tier
          dismissalTime,
          profileImageUrl: null,
        };
        
        let student: Student;
        
        try {
          // Insert the student into the database
          student = await storage.createStudent(studentData);
          importedStudents.push(student);
        } catch (err) {
          errors.push(`Failed to insert student ${firstName} ${lastName}: ${err}`);
        }
      } catch (err) {
        errors.push(`Error processing row: ${JSON.stringify(row)}: ${err}`);
      }
    }
    
    return {
      imported: importedStudents.length,
      errors,
      students: importedStudents,
    };
    
  } catch (error) {
    console.error("Error importing Excel data:", error);
    throw new Error(`Failed to import Excel data: ${error}`);
  }
}