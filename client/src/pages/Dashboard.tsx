import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDate, getToday, getProgramPeriodColor } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { StaffCard } from "@/components/dashboard/StaffCard";
import { AnnouncementCard } from "@/components/dashboard/AnnouncementCard";
import { 
  School, 
  CalendarCheck, 
  UserRound, 
  Megaphone, 
  Plus, 
  ChevronDown,
  MapPin,
  User,
  MoreHorizontal
} from "lucide-react";
import { Activity, Announcement, Staff } from "@shared/schema";

export default function Dashboard() {
  const [date, setDate] = useState(getToday());
  
  // Get dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });
  
  // Get activities for today
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: [`/api/activities?date=${date}`],
  });
  
  // Get active staff
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['/api/staff?active=true'],
  });
  
  // Get announcements
  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ['/api/announcements?limit=3'],
  });
  
  // Filter activities by program period
  const beforeSchoolActivities = activities?.filter(
    (activity: Activity) => activity.programPeriod === 'before-school'
  ) || [];
  
  const afterSchoolActivities = activities?.filter(
    (activity: Activity) => activity.programPeriod === 'after-school'
  ) || [];
  
  return (
    <div className="flex-1 lg:ml-64 ml-0 pt-6 pb-12">
      <div className="container mx-auto px-4">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="font-nunito font-bold text-2xl md:text-3xl text-textColor mb-2">Dashboard</h1>
          <p className="text-darkGray">{formatDate(date)}</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={<School className="h-5 w-5" />}
            iconBgColor="bg-blue-100"
            iconColor="text-primary"
            title="Students Today"
            value={stats?.studentCount || 0}
            subtext={<span className="text-xs text-secondary"><i className="fas fa-arrow-up mr-1"></i>12%</span>}
          />
          
          <StatCard 
            icon={<CalendarCheck className="h-5 w-5" />}
            iconBgColor="bg-green-100"
            iconColor="text-secondary"
            title="Today's Activities"
            value={stats?.activitiesCount || 0}
            subtext={<span className="text-xs text-secondary">On schedule</span>}
          />
          
          <StatCard 
            icon={<UserRound className="h-5 w-5" />}
            iconBgColor="bg-red-100"
            iconColor="text-accent"
            title="Staff On Duty"
            value={stats?.staffCount || 0}
            subtext={<span className="text-xs text-accent">2 absent</span>}
          />
          
          <StatCard 
            icon={<Megaphone className="h-5 w-5" />}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-500"
            title="Announcements"
            value={stats?.announcementsCount || 0}
            subtext={<span className="text-xs text-purple-500">New today</span>}
          />
        </div>
        
        {/* Today's Schedule Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-nunito font-bold text-xl text-textColor">Today's Schedule</h2>
            <div className="flex">
              <button className="flex items-center justify-center h-9 px-4 bg-primary text-white rounded-custom font-nunito font-semibold text-sm mr-2 hover:bg-blue-600 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </button>
              <div className="relative">
                <select 
                  className="h-9 pl-3 pr-8 bg-white border border-lightGray rounded-custom font-nunito text-sm text-textColor appearance-none focus:outline-none focus:border-primary"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                >
                  <option value={getToday()}>{formatDate(getToday())}</option>
                  <option value={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}>
                    {formatDate(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0])}
                  </option>
                  <option value={new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0]}>
                    {formatDate(new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0])}
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-darkGray">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Before School Schedule */}
          {beforeSchoolActivities.length > 0 && (
            <div className="mb-6">
              <h3 className="flex items-center font-nunito font-semibold text-md text-textColor mb-3">
                <span className="w-2 h-6 bg-primary rounded-full mr-2"></span>
                Before School (7:00 - 8:30 AM)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {beforeSchoolActivities.map((activity: Activity) => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    programPeriod="before-school" 
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* After School Schedule */}
          {afterSchoolActivities.length > 0 && (
            <div>
              <h3 className="flex items-center font-nunito font-semibold text-md text-textColor mb-3">
                <span className="w-2 h-6 bg-secondary rounded-full mr-2"></span>
                After School (2:30 - 6:00 PM)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {afterSchoolActivities.map((activity: Activity) => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    programPeriod="after-school" 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staff Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-custom shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-nunito font-bold text-lg text-textColor">Staff on Duty</h3>
                <button className="text-primary hover:text-blue-700 text-sm transition-colors">View All</button>
              </div>
              
              <div>
                {staffLoading ? (
                  <p>Loading staff...</p>
                ) : (
                  staffData?.map((staffMember: Staff) => (
                    <StaffCard key={staffMember.id} staffMember={staffMember} />
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Announcements Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-custom shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-nunito font-bold text-lg text-textColor">Announcements</h3>
                <button className="text-primary hover:text-blue-700 text-sm font-nunito transition-colors">
                  <Plus className="h-4 w-4 inline mr-1" />
                  New Announcement
                </button>
              </div>
              
              <div>
                {announcementsLoading ? (
                  <p>Loading announcements...</p>
                ) : (
                  announcements?.map((announcement: Announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
