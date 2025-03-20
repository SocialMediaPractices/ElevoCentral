import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Star, 
  Shapes, 
  MessageSquare, 
  UserPlus,
  Settings,
  HelpCircle,
  GraduationCap,
  BookOpen
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const sidebarLinks = [
    { href: "/", icon: <LayoutDashboard className="mr-3 w-5 text-center" />, label: "Dashboard" },
    { href: "/programs", icon: <Calendar className="mr-3 w-5 text-center" />, label: "Programs" },
    { href: "/staff", icon: <Users className="mr-3 w-5 text-center" />, label: "Staff" },
    { href: "/students", icon: <GraduationCap className="mr-3 w-5 text-center" />, label: "Students" },
    { href: "/homework", icon: <BookOpen className="mr-3 w-5 text-center" />, label: "Homework" },
    { href: "/events", icon: <Star className="mr-3 w-5 text-center" />, label: "Events" },
    { href: "/clubs", icon: <Shapes className="mr-3 w-5 text-center" />, label: "Clubs" },
    { 
      href: "/messages", 
      icon: <MessageSquare className="mr-3 w-5 text-center" />, 
      label: "Messages", 
      badge: 5 
    },
    { href: "/parents", icon: <UserPlus className="mr-3 w-5 text-center" />, label: "Parents" },
  ];
  
  const secondaryLinks = [
    { href: "/settings", icon: <Settings className="mr-3 w-5 text-center" />, label: "Settings" },
    { href: "/help", icon: <HelpCircle className="mr-3 w-5 text-center" />, label: "Help Center" },
  ];
  
  const mobileClasses = isOpen ? "mobile-menu-visible" : "mobile-menu-hidden";
  
  return (
    <nav id="main-nav" className={`main-sidebar bg-white w-64 shadow-md fixed h-full z-10 transition-transform duration-300 ${mobileClasses} desktop-nav lg:relative`}>
      <div className="py-6 px-4">
        <div className="mb-8 px-2">
          <div className="flex flex-col items-center mb-4">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
              alt="Profile" 
              className="w-16 h-16 rounded-full object-cover border-2 border-primary mb-2"
            />
            <h3 className="font-nunito font-bold text-lg text-textColor">Sara Mitchell</h3>
            <p className="text-sm text-darkGray">Program Director</p>
          </div>
        </div>
        
        <ul>
          {sidebarLinks.map((link) => (
            <li key={link.href} className="mb-1">
              <Link 
                href={link.href} 
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center px-4 py-3 rounded-custom font-nunito font-semibold transition-colors",
                  location === link.href 
                    ? "text-primary bg-blue-50" 
                    : "text-textColor hover:bg-background"
                )}
              >
                {link.icon}
                {link.label}
                {link.badge && (
                  <span className="ml-auto bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="mt-8 border-t border-lightGray pt-6">
          <ul>
            {secondaryLinks.map((link) => (
              <li key={link.href} className="mb-1">
                <Link 
                  href={link.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className="flex items-center px-4 py-2 text-darkGray hover:bg-background rounded-custom font-nunito transition-colors"
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
