import { formatTime, getActivityTypeColor } from "@/lib/utils";
import { Activity, Staff } from "@shared/schema";
import { MapPin, User, MoreHorizontal } from "lucide-react";

interface ActivityCardProps {
  activity: Activity & { staff?: Staff[] };
  programPeriod: "before-school" | "after-school";
}

export function ActivityCard({ activity, programPeriod }: ActivityCardProps) {
  const typeColors = getActivityTypeColor(activity.activityType);
  const periodClass = programPeriod === "before-school" ? "before-school" : "after-school";
  const periodColor = programPeriod === "before-school" ? "text-primary" : "text-secondary";
  
  const staffNames = activity.staff 
    ? activity.staff.map(s => `${s.title} ${s.userId}`).join(", ")
    : "";

  return (
    <div className={`card bg-white ${periodClass} p-4`}>
      <div className="flex justify-between mb-3">
        <span className={`font-nunito font-semibold ${periodColor}`}>
          {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
        </span>
        <div className="flex">
          <span className={`${typeColors.bg} ${typeColors.text} text-xs py-1 px-2 rounded-full font-nunito`}>
            {activity.activityType.charAt(0).toUpperCase() + activity.activityType.slice(1)}
          </span>
        </div>
      </div>
      
      <h4 className="font-nunito font-bold text-textColor mb-1">{activity.name}</h4>
      
      <div className="flex items-center text-sm text-darkGray mb-2">
        <MapPin className="h-4 w-4 mr-1" />
        <span>{activity.location}</span>
      </div>
      
      <div className="flex items-center text-sm text-darkGray mb-3">
        <User className="h-4 w-4 mr-1" />
        <span>{staffNames}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xs bg-gray-100 text-darkGray py-1 px-2 rounded-full">
            {activity.studentCount} students
          </span>
        </div>
        <button className="text-primary hover:text-blue-700 transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
