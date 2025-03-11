import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: string | number;
  subtext?: ReactNode;
}

export function StatCard({ 
  icon, 
  iconBgColor, 
  iconColor, 
  title, 
  value, 
  subtext 
}: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-custom shadow-sm">
      <div className="flex items-center mb-2">
        <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center mr-3`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <span className="font-nunito font-semibold text-darkGray">{title}</span>
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold font-nunito text-textColor mr-2">{value}</span>
        {subtext && <span className="text-xs">{subtext}</span>}
      </div>
    </div>
  );
}
