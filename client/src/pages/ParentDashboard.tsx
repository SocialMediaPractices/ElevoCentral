import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, AlertCircle, CheckCircle2, Clock, BookOpen, Award, MessageSquare, Bell, User, CalendarClock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { formatDate, formatTime, getActivityTypeColor, getAvatarLetters } from "@/lib/utils";

type Child = {
  id: number;
  name: string;
  grade: string;
  profileImageUrl: string | null;
  behaviorTier: string;
  dismissalTime: string;
};

type HomeworkAssignment = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignedDate: string;
  status: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    grade: string;
    profileImageUrl: string | null;
  } | null;
  activity: {
    id: number;
    name: string;
    type: string;
  } | null;
  assignedBy: {
    id: number;
    firstName: string;
    lastName: string;
    title: string;
    profileImageUrl: string | null;
  } | null;
};

type BehaviorNote = {
  id: number;
  date: string;
  time: string;
  note: string;
  isPositive: boolean;
  isPrivate: boolean;
  parentRead: boolean;
  student: {
    id: number;
    name: string;
    grade: string;
    profileImageUrl: string | null;
  } | null;
  staff: {
    id: number;
    name: string;
    title: string;
    profileImageUrl: string | null;
  } | null;
};

type BehaviorIncident = {
  id: number;
  incidentDate: string;
  incidentTime: string;
  incidentType: string;
  description: string;
  location: string;
  isResolved: boolean;
  actionTaken: string | null;
  student: {
    id: number;
    name: string;
    grade: string;
    profileImageUrl: string | null;
  } | null;
  reporter: {
    id: number;
    name: string;
    title: string;
    profileImageUrl: string | null;
  } | null;
};

type DailySchedule = {
  regularDay: {
    checkIn: {
      kindergarten: string;
      regular: string;
    };
    periods: {
      time: string;
      activities: {
        grade: string;
        activity: string;
      }[];
    }[];
    dismissalTimes: {
      time: string;
      type: string;
    }[];
  };
};

type ParentDashboardData = {
  children: Child[];
  recentHomework: HomeworkAssignment[];
  unreadNotes: BehaviorNote[];
  recentIncidents: BehaviorIncident[];
  dailySchedule: DailySchedule;
};

// Function to get tier badge color
function getTierBadgeColor(tier: string) {
  switch (tier) {
    case 'good-standing':
      return 'bg-green-100 text-green-800';
    case 'yellow-warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'red-alert':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Function to get human-readable tier name
function getTierName(tier: string) {
  switch (tier) {
    case 'good-standing':
      return 'Good Standing';
    case 'yellow-warning':
      return 'Yellow Warning';
    case 'red-alert':
      return 'Red Alert';
    default:
      return tier.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}

// Function to get status badge color
function getStatusBadgeColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Function to get dismissal time badge color
function getDismissalBadgeColor(time: string) {
  switch (time) {
    case '4:30':
      return 'bg-amber-100 text-amber-800';
    case '5:00':
      return 'bg-orange-100 text-orange-800';
    case '5:30':
      return 'bg-purple-100 text-purple-800';
    case '6:00':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// WebSocket connection handler
function useWebSocketConnection(userId: number | null | undefined) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Subscribe to updates for this parent
      ws.send(JSON.stringify({
        type: 'subscribe',
        entityType: 'parent',
        entityId: userId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        setLastMessage(message);

        // Handle different message types
        if (message.type === 'update') {
          // Show toast notification
          toast({
            title: 'New Update',
            description: `You have a new ${message.entityType} update`,
            variant: 'default'
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    setSocket(ws);

    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, [userId]);

  return { socket, connected, lastMessage };
}

export default function ParentDashboard() {
  // Get current user
  interface UserData {
    user?: {
      id: number;
      username: string;
      fullName: string;
      role: string;
      profileImageUrl?: string;
    };
  }
  
  const { data: userData } = useQuery<UserData>({ 
    queryKey: ['/api/auth/user'],
    enabled: true
  });
  
  const userId = userData?.user?.id;

  // Setup WebSocket connection
  const { connected: wsConnected, lastMessage } = useWebSocketConnection(userId);
  
  // Fetch parent dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery<ParentDashboardData>({
    queryKey: ['/api/parent/dashboard'],
    enabled: !!userId
  });

  // Refetch data when we get a real-time update
  useEffect(() => {
    if (lastMessage?.type === 'update') {
      refetch();
    }
  }, [lastMessage, refetch]);

  // Mark a behavior note as read
  const markNoteAsRead = async (noteId: number) => {
    try {
      await apiRequest('PATCH', '/api/behavior-notes/' + noteId + '/mark-read');
      
      toast({
        title: 'Note marked as read',
        description: 'The note has been marked as read',
        variant: 'default'
      });
      
      refetch();
    } catch (error) {
      console.error('Error marking note as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark note as read',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading parent dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-4">We encountered an error while loading your dashboard.</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!dashboardData?.children || dashboardData.children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <User className="h-12 w-12 text-blue-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Children Found</h2>
        <p className="text-gray-600 mb-4">
          There are no children associated with your account.
          Please contact the school administration for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Parent Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData?.user?.fullName}</p>
        </div>
        {wsConnected && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            Connected
          </Badge>
        )}
      </div>

      {/* Children Section */}
      <h2 className="text-xl font-semibold mb-4">My Children</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {dashboardData.children.map((child) => (
          <Card key={child.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-3">
                  {child.profileImageUrl ? (
                    <AvatarImage src={child.profileImageUrl} alt={child.name} />
                  ) : (
                    <AvatarFallback>{getAvatarLetters(child.name)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{child.name}</CardTitle>
                  <CardDescription>Grade {child.grade}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium mr-2">Behavior Status:</span>
                <Badge className={getTierBadgeColor(child.behaviorTier)}>
                  {getTierName(child.behaviorTier)}
                </Badge>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium mr-2">Dismissal Time:</span>
                <Badge className={getDismissalBadgeColor(child.dismissalTime)}>
                  {child.dismissalTime} PM
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 bg-gray-50">
              <Button variant="outline" className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="homework" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="homework" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Homework
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Behavior Notes
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center">
            <CalendarClock className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Homework Tab */}
        <TabsContent value="homework" className="pt-2">
          <h3 className="text-lg font-semibold mb-3">Recent Homework Assignments</h3>
          <div className="space-y-4">
            {dashboardData.recentHomework.length > 0 ? (
              dashboardData.recentHomework.map((homework) => (
                <Card key={homework.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{homework.title}</CardTitle>
                      <Badge className={getStatusBadgeColor(homework.status)}>
                        {homework.status.charAt(0).toUpperCase() + homework.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Due: {formatDate(homework.dueDate)} • Assigned by: {homework.assignedBy?.firstName} {homework.assignedBy?.lastName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{homework.description}</p>
                    {homework.activity && (
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Activity:</span>
                        <Badge variant="outline" className={`${getActivityTypeColor(homework.activity.type).bg} ${getActivityTypeColor(homework.activity.type).text}`}>
                          {homework.activity.name}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Assigned: {formatDate(homework.assignedDate)}
                      </span>
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Student:</span>
                        <Badge variant="outline">
                          {homework.student?.firstName} {homework.student?.lastName}
                        </Badge>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium">No homework assignments</h3>
                <p className="text-gray-600">Your children are up to date with all assignments.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Behavior Notes Tab */}
        <TabsContent value="notes" className="pt-2">
          <h3 className="text-lg font-semibold mb-3">Unread Behavior Notes</h3>
          <div className="space-y-4">
            {dashboardData.unreadNotes.length > 0 ? (
              dashboardData.unreadNotes.map((note) => (
                <Card key={note.id} className="overflow-hidden">
                  <CardHeader className={`pb-3 ${note.isPositive ? 'bg-green-50' : 'bg-orange-50'}`}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center">
                        {note.isPositive ? (
                          <Award className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                        )}
                        {note.isPositive ? 'Positive Behavior' : 'Behavior Note'}
                      </CardTitle>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        New
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDate(note.date)} at {formatTime(note.time)} • From: {note.staff?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-3">
                    <p className="text-sm">{note.note}</p>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 flex justify-between">
                    <div className="flex items-center">
                      <span className="text-xs font-medium mr-2">Student:</span>
                      <Badge variant="outline">
                        {note.student?.name}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => markNoteAsRead(note.id)}
                    >
                      Mark as Read
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium">No unread notes</h3>
                <p className="text-gray-600">You've caught up with all behavior notes.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="pt-2">
          <h3 className="text-lg font-semibold mb-3">Recent Incidents</h3>
          <div className="space-y-4">
            {dashboardData.recentIncidents.length > 0 ? (
              dashboardData.recentIncidents.map((incident) => (
                <Card key={incident.id} className="overflow-hidden">
                  <CardHeader className="pb-3 bg-red-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        {incident.incidentType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </CardTitle>
                      <Badge variant={incident.isResolved ? "outline" : "secondary"} className={incident.isResolved ? "bg-green-50 text-green-700" : ""}>
                        {incident.isResolved ? "Resolved" : "Pending"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDate(incident.incidentDate)} at {formatTime(incident.incidentTime)} • Location: {incident.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-3">
                    <p className="text-sm mb-3">{incident.description}</p>
                    {incident.actionTaken && (
                      <div className="mt-2">
                        <span className="text-xs font-medium block mb-1">Action Taken:</span>
                        <p className="text-sm bg-gray-50 p-2 rounded">{incident.actionTaken}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 flex justify-between">
                    <div className="flex items-center">
                      <span className="text-xs font-medium mr-2">Student:</span>
                      <Badge variant="outline">
                        {incident.student?.name}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium mr-2">Reported by:</span>
                      <span className="text-xs text-gray-600">{incident.reporter?.name}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium">No recent incidents</h3>
                <p className="text-gray-600">There are no behavior incidents to report.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="pt-2">
          <h3 className="text-lg font-semibold mb-3">Daily Schedule</h3>
          <div className="space-y-8">
            {/* Dismissal Times */}
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center">
                  <CalendarClock className="h-5 w-5 text-blue-600 mr-2" />
                  Dismissal Schedule
                </CardTitle>
                <CardDescription>
                  Scheduled dismissal times for your children
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.children.map(child => (
                      <div key={child.id} className="flex items-center space-x-3 border rounded-md p-3">
                        <Avatar className="h-10 w-10">
                          {child.profileImageUrl ? (
                            <AvatarImage src={child.profileImageUrl} alt={child.name} />
                          ) : (
                            <AvatarFallback>{getAvatarLetters(child.name)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium">{child.name}</div>
                          <div className="text-sm text-gray-500">Grade {child.grade}</div>
                        </div>
                        <div className="ml-auto">
                          <Badge className={getDismissalBadgeColor(child.dismissalTime)}>
                            {child.dismissalTime} PM
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 mt-4">
                    <p className="font-medium mb-1">Dismissal Time Options:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      {dashboardData.dailySchedule.regularDay.dismissalTimes.map((option, index) => (
                        <li key={index}><span className="font-medium">{option.time}</span> - {option.type}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Daily Schedule */}
            <Card>
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-600 mr-2" />
                  Regular Day Schedule
                </CardTitle>
                <CardDescription>
                  Daily activities and schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">Check-In Times</div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span>Kindergarten:</span>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {dashboardData.dailySchedule.regularDay.checkIn.kindergarten}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Regular Grades:</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {dashboardData.dailySchedule.regularDay.checkIn.regular}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">Daily Activities</div>
                    <div className="p-4 space-y-4">
                      {dashboardData.dailySchedule.regularDay.periods.map((period, index) => (
                        <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="font-medium text-blue-700 mb-2">{period.time}</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {period.activities.map((activity, actIndex) => (
                              <div key={actIndex} className="bg-gray-50 p-2 rounded-md flex justify-between">
                                <span className="font-medium">{activity.grade}:</span>
                                <span>{activity.activity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">Important Notes</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>All students must check in at their designated time</li>
                      <li>If a student needs early dismissal outside of the scheduled times, please contact the office</li>
                      <li>Students will only be released to authorized adults listed in their file</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Real-time Status Indicator */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <p className="text-sm text-gray-500">Dashboard updates in real-time</p>
          </div>
          <div>
            {wsConnected ? (
              <span className="text-sm text-green-600 flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                Real-time updates active
              </span>
            ) : (
              <span className="text-sm text-yellow-600 flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></div>
                Updates paused, refresh for latest data
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}