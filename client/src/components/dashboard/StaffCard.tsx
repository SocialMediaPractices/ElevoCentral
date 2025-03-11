import { Staff, User } from "@shared/schema";

interface StaffCardProps {
  staffMember: Staff & { 
    user?: {
      fullName: string;
      profileImageUrl?: string;
    };
    activities?: string[];
  };
}

export function StaffCard({ staffMember }: StaffCardProps) {
  return (
    <div className="flex items-center py-2 border-b border-lightGray last:border-0">
      <img 
        src={staffMember.user?.profileImageUrl || "https://via.placeholder.com/100"}
        alt={staffMember.user?.fullName || "Staff member"} 
        className="w-10 h-10 rounded-full object-cover mr-3"
      />
      <div className="flex-1">
        <h4 className="font-nunito font-semibold text-textColor">
          {staffMember.title} {staffMember.user?.fullName?.split(" ")[0] || ""}
        </h4>
        <p className="text-xs text-darkGray">{staffMember.activities?.join(", ") || "No activities assigned"}</p>
      </div>
      <span className={`inline-block w-2 h-2 ${staffMember.isActive ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></span>
    </div>
  );
}
