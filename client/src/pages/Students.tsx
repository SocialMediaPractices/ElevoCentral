import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Student } from "@shared/schema";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getAvatarLetters, formatDate } from "@/lib/utils";
import { 
  AlertCircle, 
  AlertTriangle, 
  ArrowUpDown, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  UserCircle2, 
  Shield, 
  MessageSquare, 
  History, 
  BookOpen 
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StudentWithDetails = Student & {
  parent?: {
    id: number;
    fullName: string;
    profileImageUrl?: string;
  }
};

type BehaviorIncident = {
  id: number;
  incidentDate: string;
  incidentTime: string;
  incidentType: string;
  description: string;
  location: string;
  isResolved: boolean;
  actionTaken?: string;
  student?: {
    id: number;
    name: string;
    grade: string;
    profileImageUrl?: string;
  };
  reporter?: {
    id: number;
    name: string;
    title: string;
    profileImageUrl?: string;
  };
};

type BehaviorNote = {
  id: number;
  date: string;
  time: string;
  note: string;
  isPositive: boolean;
  isPrivate: boolean;
  parentRead: boolean;
  student?: {
    id: number;
    name: string;
    grade: string;
    profileImageUrl?: string;
  };
  staff?: {
    id: number;
    name: string;
    title: string;
    profileImageUrl?: string;
  };
};

type TierTransition = {
  id: number;
  fromTier: string;
  toTier: string;
  date: string;
  reason: string;
  parentNotified: boolean;
  student?: {
    id: number;
    name: string;
    grade: string;
    profileImageUrl?: string;
  };
  authorizedBy?: {
    id: number;
    name: string;
    title: string;
    profileImageUrl?: string;
  };
};

// Component for displaying tier badge with color
function TierBadge({ tier }: { tier: string }) {
  let variant: "default" | "outline" | "secondary" | "destructive" = "default";
  
  switch (tier) {
    case "good-standing":
      variant = "default"; // blue
      break;
    case "tier-1":
      variant = "secondary"; // yellow/orange
      break;
    case "tier-2":
      variant = "outline"; // orange/red outline
      break;
    case "tier-3":
    case "suspended":
      variant = "destructive"; // red
      break;
  }
  
  const displayName = {
    "good-standing": "Good Standing",
    "tier-1": "Tier 1",
    "tier-2": "Tier 2",
    "tier-3": "Tier 3",
    "suspended": "Suspended"
  }[tier] || tier;
  
  return <Badge variant={variant}>{displayName}</Badge>;
}

// Component for displaying incident type badge with color
function IncidentTypeBadge({ type }: { type: string }) {
  let variant: "default" | "secondary" | "outline" | "destructive" = "default";
  
  switch (type) {
    case "disruption":
      variant = "secondary"; // yellow
      break;
    case "disrespect":
      variant = "outline"; // grey outline
      break;
    case "physical":
    case "bullying":
      variant = "destructive"; // red
      break;
    case "property-damage":
      variant = "secondary"; // yellow/orange
      break;
    default:
      variant = "default"; // blue
  }
  
  const displayName = {
    "disruption": "Disruption",
    "disrespect": "Disrespect",
    "physical": "Physical",
    "property-damage": "Property Damage",
    "bullying": "Bullying",
    "other": "Other"
  }[type] || type;
  
  return <Badge variant={variant}>{displayName}</Badge>;
}

// Student details dialog component
function StudentDetails({ student }: { student: StudentWithDetails }) {
  const [activeTab, setActiveTab] = useState("info");
  
  const { data: incidents } = useQuery<BehaviorIncident[]>({
    queryKey: ['/api/behavior-incidents', { studentId: student.id }],
    enabled: activeTab === "incidents"
  });
  
  const { data: notes } = useQuery<BehaviorNote[]>({
    queryKey: ['/api/behavior-notes', { studentId: student.id }],
    enabled: activeTab === "notes"
  });
  
  const { data: transitions } = useQuery<TierTransition[]>({
    queryKey: ['/api/tier-transitions', { studentId: student.id }],
    enabled: activeTab === "transitions"
  });
  
  return (
    <div className="overflow-hidden rounded-md border bg-background p-0 shadow">
      <div className="flex items-center gap-4 border-b p-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={student.profileImageUrl || undefined} />
          <AvatarFallback className="text-lg">
            {getAvatarLetters(`${student.firstName} ${student.lastName}`)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">
            {student.firstName} {student.lastName}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Grade {student.grade}</span>
            <TierBadge tier={student.currentTier} />
          </div>
        </div>
      </div>
      
      <Tabs 
        defaultValue="info" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="border-b">
          <TabsList className="justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="info"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            >
              <UserCircle2 className="mr-2 h-4 w-4" />
              Info
            </TabsTrigger>
            <TabsTrigger
              value="incidents"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Incidents
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            >
              <FileText className="mr-2 h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger
              value="transitions"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            >
              <History className="mr-2 h-4 w-4" />
              Tier History
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="info" className="p-4">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Parent/Guardian</h4>
                {student.parent ? (
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.parent.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {getAvatarLetters(student.parent.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{student.parent.fullName}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not assigned</span>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Emergency Contact</h4>
                <p className="mt-1">{student.emergencyContact || "Not provided"}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Medical Notes</h4>
              <p className="mt-1">{student.medicalNotes || "None"}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Current Tier Status</h4>
              <div className="mt-1 flex items-center gap-2">
                <TierBadge tier={student.currentTier} />
                {student.tierUpdateDate && (
                  <span className="text-sm text-muted-foreground">
                    Since {formatDate(student.tierUpdateDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="incidents" className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Behavior Incidents</h3>
              <Button size="sm">
                <AlertCircle className="mr-2 h-4 w-4" />
                Report New Incident
              </Button>
            </div>
            
            {!incidents || incidents.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No behavior incidents reported
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-medium">
                          {formatDate(incident.incidentDate)}
                          <div className="text-xs text-muted-foreground">
                            {incident.incidentTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <IncidentTypeBadge type={incident.incidentType} />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {incident.description}
                        </TableCell>
                        <TableCell>
                          {incident.isResolved ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <Check className="mr-1 h-3 w-3" />
                              Resolved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Open
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="notes" className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Behavior Notes</h3>
              <Button size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>
            
            {!notes || notes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No behavior notes recorded
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id} className={note.isPositive ? "border-green-200" : "border-amber-200"}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={note.isPositive ? "default" : "secondary"}>
                            {note.isPositive ? "Positive" : "Needs Improvement"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(note.date)} • {note.time}
                          </span>
                        </div>
                        {note.isPrivate && (
                          <Badge variant="outline" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Staff Only
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{note.note}</p>
                      {note.staff && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Recorded by:</span>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={note.staff.profileImageUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {getAvatarLetters(note.staff.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{note.staff.name}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="transitions" className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tier Transition History</h3>
            
            {!transitions || transitions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No tier transitions recorded
              </div>
            ) : (
              <div className="space-y-6">
                {transitions.map((transition, index) => (
                  <div key={transition.id} className="relative pl-8">
                    {/* Vertical timeline line */}
                    {index < transitions.length - 1 && (
                      <div className="absolute left-3.5 top-8 h-full w-0.5 bg-muted"></div>
                    )}
                    
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border bg-card">
                      {transition.toTier === "good-standing" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{formatDate(transition.date)}</span>
                        <div className="flex items-center gap-1.5">
                          <TierBadge tier={transition.fromTier} />
                          <ChevronRight className="h-4 w-4" />
                          <TierBadge tier={transition.toTier} />
                        </div>
                      </div>
                      
                      <p className="text-sm">{transition.reason}</p>
                      
                      {transition.authorizedBy && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Authorized by:</span>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={transition.authorizedBy.profileImageUrl || undefined} />
                              <AvatarFallback className="text-[10px]">
                                {getAvatarLetters(transition.authorizedBy.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{transition.authorizedBy.name}</span>
                          </div>
                        </div>
                      )}
                      
                      {transition.parentNotified && (
                        <Badge variant="outline" className="mt-1">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Parent Notified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function Students() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string; 
    direction: 'ascending' | 'descending'
  }>({ key: 'lastName', direction: 'ascending' });
  
  const { toast } = useToast();
  
  const { data: students, isLoading } = useQuery<StudentWithDetails[]>({
    queryKey: ['/api/students', { tier: selectedTier }],
  });

  // Function to handle sorting
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    
    setSortConfig({ key, direction });
  };

  // Sorting function
  const sortedStudents = students ? [...students].sort((a, b) => {
    if (sortConfig.key === 'name') {
      const nameA = `${a.lastName}, ${a.firstName}`.toLowerCase();
      const nameB = `${b.lastName}, ${b.firstName}`.toLowerCase();
      return sortConfig.direction === 'ascending' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortConfig.key === 'grade') {
      return sortConfig.direction === 'ascending'
        ? a.grade.localeCompare(b.grade)
        : b.grade.localeCompare(a.grade);
    } else if (sortConfig.key === 'tier') {
      const tierOrder = ['good-standing', 'tier-1', 'tier-2', 'tier-3', 'suspended'];
      const indexA = tierOrder.indexOf(a.currentTier);
      const indexB = tierOrder.indexOf(b.currentTier);
      return sortConfig.direction === 'ascending'
        ? indexA - indexB
        : indexB - indexA;
    }
    return 0;
  }) : [];

  return (
    <div className="container py-6">
      <h1 className="mb-2 text-2xl font-bold">Students</h1>
      <p className="mb-6 text-muted-foreground">
        View and manage student information and behavior tracking
      </p>
      
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedTier || ""} onValueChange={(value) => setSelectedTier(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tiers</SelectItem>
              <SelectItem value="good-standing">Good Standing</SelectItem>
              <SelectItem value="tier-1">Tier 1</SelectItem>
              <SelectItem value="tier-2">Tier 2</SelectItem>
              <SelectItem value="tier-3">Tier 3</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Behavior Reports
          </Button>
          <Button>
            <UserCircle2 className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Student Roster</CardTitle>
          <CardDescription>
            {students ? `${students.length} students` : 'Loading student data...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading students...
            </div>
          ) : !students || students.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No students found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                      <div className="flex items-center">
                        Student
                        {sortConfig.key === 'name' && (
                          sortConfig.direction === 'ascending' 
                            ? <ChevronUp className="ml-1 h-4 w-4" /> 
                            : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('grade')} className="cursor-pointer">
                      <div className="flex items-center">
                        Grade
                        {sortConfig.key === 'grade' && (
                          sortConfig.direction === 'ascending' 
                            ? <ChevronUp className="ml-1 h-4 w-4" /> 
                            : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('tier')} className="cursor-pointer">
                      <div className="flex items-center">
                        Behavior Status
                        {sortConfig.key === 'tier' && (
                          sortConfig.direction === 'ascending' 
                            ? <ChevronUp className="ml-1 h-4 w-4" /> 
                            : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Parent/Guardian</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {getAvatarLetters(`${student.firstName} ${student.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.lastName}, {student.firstName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>
                        <TierBadge tier={student.currentTier} />
                      </TableCell>
                      <TableCell>
                        {student.parent ? (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={student.parent.profileImageUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {getAvatarLetters(student.parent.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{student.parent.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-0">
                            <DialogHeader className="px-6 pt-6">
                              <DialogTitle>Student Details</DialogTitle>
                            </DialogHeader>
                            {selectedStudent && (
                              <StudentDetails student={selectedStudent} />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}