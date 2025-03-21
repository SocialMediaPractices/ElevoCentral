import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RosterImport() {
  const [filePath, setFilePath] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    studentsImported?: { firstName: string; lastName: string; grade: string }[];
    errors?: string[];
  } | null>(null);
  
  // For file upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Path-based import
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
  
  // File upload import
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      setResult(null);
      
      // Create a simple message to show that file upload is not yet implemented
      // In a real implementation, we would use FormData to send the file to the server
      toast({
        title: 'File Upload',
        description: 'File upload feature is coming soon. For now, please use the file path option.',
      });
      
      setLoading(false);
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
          <Tabs defaultValue="filepath" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="filepath">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                File Path
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="mr-2 h-4 w-4" />
                File Upload
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="filepath" className="space-y-4">
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
              
              <div className="flex justify-end">
                <Button onClick={handleImport} disabled={loading || !filePath}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import File'
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileUpload">Upload Excel File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <input
                    type="file"
                    id="fileUpload"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".xls,.xlsx,.csv"
                  />
                  
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    {selectedFile ? (
                      <p className="font-medium">{selectedFile.name}</p>
                    ) : (
                      <p className="text-muted-foreground">Drag and drop or click to select</p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported file types: .xlsx, .xls, .csv
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleFileUpload} 
                  disabled={loading || !selectedFile}
                  className="bg-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload and Import'
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'} className="mt-6">
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
        </CardContent>
      </Card>
    </div>
  );
}