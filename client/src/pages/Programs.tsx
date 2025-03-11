import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Plus, Filter, ChevronDown } from "lucide-react";
import { formatDate, getToday } from "@/lib/utils";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { Activity } from "@shared/schema";

export default function Programs() {
  const [date, setDate] = useState(getToday());
  const [filter, setFilter] = useState("all");
  
  // Get activities
  const { data: activities, isLoading } = useQuery({
    queryKey: [`/api/activities?date=${date}`],
  });
  
  // Filter activities
  const filteredActivities = activities?.filter((activity: Activity) => {
    if (filter === "all") return true;
    if (filter === "before-school") return activity.programPeriod === "before-school";
    if (filter === "after-school") return activity.programPeriod === "after-school";
    return activity.activityType === filter;
  });
  
  // Group activities by program period
  const beforeSchoolActivities = filteredActivities?.filter(
    (activity: Activity) => activity.programPeriod === 'before-school'
  ) || [];
  
  const afterSchoolActivities = filteredActivities?.filter(
    (activity: Activity) => activity.programPeriod === 'after-school'
  ) || [];
  
  return (
    <div className="flex-1 lg:ml-64 ml-0 pt-6 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-nunito font-bold text-2xl md:text-3xl text-textColor mb-2">Programs</h1>
            <p className="text-darkGray">{formatDate(date)}</p>
          </div>
          
          <div className="flex">
            <button className="flex items-center justify-center h-9 px-4 bg-primary text-white rounded-custom font-nunito font-semibold text-sm mr-2 hover:bg-blue-600 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Program
            </button>
            
            <button className="flex items-center justify-center h-9 px-4 bg-white border border-lightGray text-textColor rounded-custom font-nunito font-semibold text-sm hover:bg-gray-50 transition-colors">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
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
          
          <div className="relative ml-2">
            <select 
              className="h-9 pl-3 pr-8 bg-white border border-lightGray rounded-custom font-nunito text-sm text-textColor appearance-none focus:outline-none focus:border-primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Programs</option>
              <option value="before-school">Before School</option>
              <option value="after-school">After School</option>
              <option value="check-in">Check-in</option>
              <option value="breakfast">Breakfast</option>
              <option value="vendor">Vendor</option>
              <option value="academic">Academic</option>
              <option value="stem">STEM</option>
              <option value="arts">Arts</option>
              <option value="recreation">Recreation</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-darkGray">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="bg-white p-8 rounded-custom shadow-sm text-center">
            <p className="text-darkGray">Loading programs...</p>
          </div>
        ) : (
          <>
            {/* Before School Section */}
            {beforeSchoolActivities.length > 0 && (
              <div className="mb-8">
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
            
            {/* After School Section */}
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
            
            {filteredActivities?.length === 0 && (
              <div className="bg-white p-8 rounded-custom shadow-sm text-center">
                <p className="text-darkGray">No programs found for the selected date and filter.</p>
                <button className="mt-4 flex items-center justify-center h-9 px-4 bg-primary text-white rounded-custom font-nunito font-semibold text-sm mx-auto hover:bg-blue-600 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
