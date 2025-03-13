import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatTime, getActivityTypeColor } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';

type HomeworkAssignment = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignedDate: string;
  status: string;
  completedDate: string | null;
  completionNotes: string | null;
  verifiedByStaffId: number | null;
  verificationDate: string | null;
  parentNotified: boolean;
  parentNotificationDate: string | null;
  activityId: number;
  studentId: number;
  assignedByStaffId: number;
  student?: {
    id: number;
    name: string;
    grade: string;
    profileImageUrl: string | null;
  };
  activity?: {
    id: number;
    name: string;
    type: string;
  };
  assignedBy?: {
    id: number;
    name: string;
    title: string;
    profileImageUrl: string | null;
  };
  verifiedBy?: {
    id: number;
    name: string;
    title: string;
    profileImageUrl: string | null;
  };
};

function HomeworkStatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  
  switch (status) {
    case "assigned":
      variant = "outline";
      break;
    case "completed":
      variant = "secondary";
      break;
    case "verified":
      variant = "default";
      break;
    case "overdue":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
}

function AssignHomeworkDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentId, setStudentId] = useState('');
  const [activityId, setActivityId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { toast } = useToast();

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/students'],
    staleTime: 60000,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/activities'],
    staleTime: 60000,
  });

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ['/api/staff'],
    staleTime: 60000,
  });

  // For demo purposes, use first staff member 
  const currentStaffId = staff && Array.isArray(staff) && staff.length > 0 ? staff[0].id : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !studentId || !activityId || !dueDate || !currentStaffId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await apiRequest('/api/homework', 'POST', {
        title,
        description,
        studentId: parseInt(studentId),
        activityId: parseInt(activityId),
        assignedByStaffId: currentStaffId,
        dueDate,
        assignedDate: today,
        status: 'assigned'
      });
      
      toast({
        title: "Homework Assigned",
        description: "The homework has been successfully assigned",
      });
      
      // Reset form and close dialog
      setTitle('');
      setDescription('');
      setStudentId('');
      setActivityId('');
      setDueDate('');
      setOpen(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/homework'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign homework. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">Assign New Homework</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Homework</DialogTitle>
          <DialogDescription>
            Create a new homework assignment for a student.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student" className="text-right">
                Student
              </Label>
              <Select 
                value={studentId} 
                onValueChange={setStudentId}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {studentsLoading ? (
                    <SelectItem value="loading" disabled>Loading students...</SelectItem>
                  ) : (
                    Array.isArray(students) ? students.map((student: any) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.firstName} {student.lastName} ({student.grade})
                      </SelectItem>
                    )) : <SelectItem value="none" disabled>No students found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="activity" className="text-right">
                Activity
              </Label>
              <Select 
                value={activityId} 
                onValueChange={setActivityId}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an activity" />
                </SelectTrigger>
                <SelectContent>
                  {activitiesLoading ? (
                    <SelectItem value="loading" disabled>Loading activities...</SelectItem>
                  ) : (
                    Array.isArray(activities) ? activities.map((activity: any) => (
                      <SelectItem key={activity.id} value={activity.id.toString()}>
                        {activity.name}
                      </SelectItem>
                    )) : <SelectItem value="none" disabled>No activities found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Assign Homework</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UpdateHomeworkDialog({ 
  assignment, 
  onUpdate 
}: { 
  assignment: HomeworkAssignment, 
  onUpdate: () => void 
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(assignment.status);
  const [completionNotes, setCompletionNotes] = useState(assignment.completionNotes || '');
  const { toast } = useToast();

  const { data: staff } = useQuery({
    queryKey: ['/api/staff'],
    staleTime: 60000,
  });

  // For demo purposes, use first staff member
  const currentStaffId = staff && Array.isArray(staff) && staff.length > 0 ? staff[0].id : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (status === 'completed') {
        await apiRequest(`/api/homework/${assignment.id}/update-status`, 'PATCH', {
          status,
          completedDate: today,
          completionNotes
        });
      } else if (status === 'verified' && currentStaffId) {
        await apiRequest(`/api/homework/${assignment.id}/verify`, 'PATCH', {
          staffId: currentStaffId
        });
      } else {
        await apiRequest(`/api/homework/${assignment.id}/update-status`, 'PATCH', {
          status
        });
      }
      
      toast({
        title: "Homework Updated",
        description: "The homework status has been updated successfully",
      });
      
      // Close dialog and refresh data
      setOpen(false);
      onUpdate();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update homework. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Update</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Homework Status</DialogTitle>
          <DialogDescription>
            Change the status of "{assignment.title}" for {assignment.student?.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={status} 
                onValueChange={setStatus}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {status === 'completed' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="completionNotes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="completionNotes"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="Add completion notes"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Update Homework</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NotifyParentDialog({ 
  assignment, 
  onNotify 
}: { 
  assignment: HomeworkAssignment, 
  onNotify: () => void 
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleNotify = async () => {
    try {
      await apiRequest(`/api/homework/${assignment.id}/notify-parent`, 'PATCH');
      
      toast({
        title: "Parent Notified",
        description: "The parent has been notified about the homework assignment",
      });
      
      // Close dialog and refresh data
      setOpen(false);
      onNotify();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to notify parent. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={assignment.parentNotified}
        >
          {assignment.parentNotified ? "Parent Notified" : "Notify Parent"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notify Parent</DialogTitle>
          <DialogDescription>
            Send a notification to the parent of {assignment.student?.name} about their homework assignment "{assignment.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>This will mark the homework as notified and record the notification date.</p>
          <p className="mt-2">Are you sure you want to notify the parent?</p>
        </div>
        <DialogFooter>
          <Button onClick={handleNotify}>Notify Parent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HomeworkDetailsDialog({ assignment }: { assignment: HomeworkAssignment }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
          <DialogDescription>
            Homework Assignment Details
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-sm">Status</p>
              <p><HomeworkStatusBadge status={assignment.status} /></p>
            </div>
            <div>
              <p className="font-medium text-sm">Student</p>
              <p>{assignment.student?.name}</p>
            </div>
            <div>
              <p className="font-medium text-sm">Grade</p>
              <p>{assignment.student?.grade}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-sm">Activity</p>
              <p>{assignment.activity?.name}</p>
            </div>
            <div>
              <p className="font-medium text-sm">Assigned Date</p>
              <p>{formatDate(assignment.assignedDate)}</p>
            </div>
            <div>
              <p className="font-medium text-sm">Due Date</p>
              <p>{formatDate(assignment.dueDate)}</p>
            </div>
          </div>
          
          <div>
            <p className="font-medium text-sm">Description</p>
            <p className="text-sm mt-1">{assignment.description}</p>
          </div>
          
          {assignment.completedDate && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm">Completed Date</p>
                  <p>{formatDate(assignment.completedDate)}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Verified</p>
                  <p>{assignment.verifiedByStaffId ? "Yes" : "No"}</p>
                </div>
              </div>
              
              {assignment.completionNotes && (
                <div>
                  <p className="font-medium text-sm">Completion Notes</p>
                  <p className="text-sm mt-1">{assignment.completionNotes}</p>
                </div>
              )}
            </>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-sm">Assigned By</p>
              <p>{assignment.assignedBy?.name}</p>
            </div>
            {assignment.verifiedBy && (
              <div>
                <p className="font-medium text-sm">Verified By</p>
                <p>{assignment.verifiedBy.name}</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-sm">Parent Notified</p>
              <p>{assignment.parentNotified ? "Yes" : "No"}</p>
            </div>
            {assignment.parentNotificationDate && (
              <div>
                <p className="font-medium text-sm">Notification Date</p>
                <p>{formatDate(assignment.parentNotificationDate)}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Homework() {
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: homeworkAssignments, isLoading, refetch } = useQuery({
    queryKey: ['/api/homework'],
    staleTime: 30000,
  });
  
  // Filter homework assignments based on active tab
  const filteredAssignments = homeworkAssignments && Array.isArray(homeworkAssignments) 
    ? homeworkAssignments.filter((assignment: HomeworkAssignment) => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return assignment.status === "assigned";
        if (activeTab === "completed") return assignment.status === "completed";
        if (activeTab === "verified") return assignment.status === "verified";
        if (activeTab === "overdue") return assignment.status === "overdue";
        return true;
      }) 
    : [];
  
  const refreshData = () => {
    refetch();
  };
  
  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homework</h1>
          <p className="text-muted-foreground">
            Assign and track student homework assignments
          </p>
        </div>
        <AssignHomeworkDialog />
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>Homework Assignments</CardTitle>
            <CardDescription>
              {activeTab === "all" && "View all homework assignments"}
              {activeTab === "pending" && "Student homework waiting to be completed"}
              {activeTab === "completed" && "Completed homework waiting for verification"}
              {activeTab === "verified" && "Verified homework assignments"}
              {activeTab === "overdue" && "Overdue homework assignments"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : filteredAssignments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment: HomeworkAssignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        {assignment.title}
                        <div className="text-xs text-muted-foreground mt-1">
                          {assignment.activity?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.student?.name}
                        <div className="text-xs text-muted-foreground mt-1">
                          Grade: {assignment.student?.grade}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(assignment.dueDate)}</TableCell>
                      <TableCell>
                        <HomeworkStatusBadge status={assignment.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <HomeworkDetailsDialog assignment={assignment} />
                          <UpdateHomeworkDialog assignment={assignment} onUpdate={refreshData} />
                          <NotifyParentDialog assignment={assignment} onNotify={refreshData} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No homework assignments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}