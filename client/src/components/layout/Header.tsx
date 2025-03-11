import { Bell, ChevronDown, Menu } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            id="mobile-menu-toggle" 
            className="lg:hidden mr-4 text-textColor"
            onClick={onMenuToggle}
          >
            <Menu className="text-xl" />
          </button>
          <div className="flex items-center">
            <span className="text-primary font-nunito font-bold text-2xl">Elevo</span>
            <span className="ml-1 text-secondary font-nunito font-semibold text-lg">Manager</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="hidden md:flex items-center mr-4">
            <Bell className="text-darkGray text-lg cursor-pointer hover:text-primary transition-colors" />
            <span className="ml-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </div>
          <div className="flex items-center">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover border-2 border-primary"
            />
            <span className="ml-2 font-nunito font-semibold hidden md:inline">Sara Mitchell</span>
            <ChevronDown className="ml-2 text-xs text-darkGray" />
          </div>
        </div>
      </div>
    </header>
  );
}
