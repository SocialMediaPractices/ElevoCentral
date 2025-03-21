import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function RosterImport() {
  const [filePath, setFilePath] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    studentsImported?: { firstName: string; lastName: string; grade: string }[];
    errors?: string[];
  } | null>(null);
  
  const { toast } = useToast();
  
  const handleImport = async () => {
    if (!filePath) {
      toast({
        title: 'Error',
        description: 'Please enter a file path',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      setResult(null);
      
      const response = await apiRequest({
        url: '/api/roster/import',
        method: 'POST',
        data: { filePath },
      });
      
      setResult(response);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `Processed ${response.studentsImported?.length || 0} students`,
        });
      } else {
        toast({
          title: 'Import Failed',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'An unknown error occurred',
      });
      
      toast({
        title: 'Error',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Roster Import Tool</CardTitle>
          <CardDescription>
            Import student data from Excel files. Use this to quickly populate roster data from attendance sheets.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filePath">Excel File Path</Label>
              <Input
                id="filePath"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="e.g., attached_assets/Scanned_Attendance_24260112.xls"
              />
              <p className="text-sm text-muted-foreground">
                Enter the path to the Excel file relative to the project root.
              </p>
            </div>
            
            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <AlertTitle>{result.success ? 'Import Successful' : 'Import Failed'}</AlertTitle>
                <AlertDescription>
                  {result.message}
                  
                  {result.success && result.studentsImported && (
                    <div className="mt-2">
                      <p className="font-semibold">Students Imported: {result.studentsImported.length}</p>
                      {result.errors && result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold text-destructive">Errors: {result.errors.length}</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                            {result.errors.slice(0, 5).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {result.errors.length > 5 && <li>...and {result.errors.length - 5} more errors</li>}
                          </ul>
                        </div>
                      )}
                      <div className="mt-2 max-h-60 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-2 py-1 text-left">First Name</th>
                              <th className="px-2 py-1 text-left">Last Name</th>
                              <th className="px-2 py-1 text-left">Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.studentsImported.map((student, index) => (
                              <tr key={index} className="border-b border-muted">
                                <td className="px-2 py-1">{student.firstName}</td>
                                <td className="px-2 py-1">{student.lastName}</td>
                                <td className="px-2 py-1">{student.grade}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button onClick={handleImport} disabled={loading || !filePath}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Roster Data'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}