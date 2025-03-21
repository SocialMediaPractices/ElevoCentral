import { Router, Request, Response } from 'express';
import { importAttendanceData } from '../utils/excel-import';
import { hasRole } from '../auth';

const router = Router();

/**
 * Process Excel file to import student attendance/roster data
 * POST /api/roster/import
 * Body: { filePath: string }
 */
router.post('/import', hasRole(['admin', 'site-manager', 'youth-development-lead']), async (req: Request, res: Response) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required',
      });
    }
    
    const result = await importAttendanceData(filePath);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in roster import:', error);
    return res.status(500).json({
      success: false,
      message: `Error importing roster data: ${error.message}`,
    });
  }
});

/**
 * Get all students (roster data)
 * GET /api/roster
 */
router.get('/', hasRole(['admin', 'site-manager', 'youth-development-lead', 'coach']), async (req: Request, res: Response) => {
  try {
    // This route is just a convenience for the roster view
    // It uses the existing getAllStudents method
    const students = await req.app.locals.storage.getAllStudents();
    
    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error('Error fetching roster:', error);
    return res.status(500).json({
      success: false,
      message: `Error fetching roster data: ${error.message}`,
    });
  }
});

export default router;