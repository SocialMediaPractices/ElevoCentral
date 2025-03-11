import { formatDateTime, getAudienceTagColors } from "@/lib/utils";
import { Announcement } from "@shared/schema";

interface AnnouncementCardProps {
  announcement: Announcement & {
    author?: {
      id: number;
      fullName: string;
      profileImageUrl?: string;
    };
  };
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <div className="mb-4 pb-4 border-b border-lightGray last:border-0 last:mb-0 last:pb-0">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-nunito font-semibold text-textColor">{announcement.title}</h4>
        <span className="text-xs text-darkGray">{announcement.createdAt}</span>
      </div>
      
      <p className="text-sm text-darkGray mb-3">{announcement.content}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {announcement.author && (
            <>
              <img 
                src={announcement.author.profileImageUrl || "https://via.placeholder.com/100"} 
                alt={announcement.author.fullName} 
                className="w-6 h-6 rounded-full object-cover mr-2"
              />
              <span className="text-xs text-darkGray">{announcement.author.fullName}</span>
            </>
          )}
        </div>
        <div className="flex text-xs">
          {announcement.targetAudience.map((audience, idx) => {
            const { bg, text } = getAudienceTagColors(audience);
            return (
              <span 
                key={idx} 
                className={`${bg} ${text} py-1 px-2 rounded-full ${idx > 0 ? 'ml-1' : ''}`}
              >
                {audience}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
