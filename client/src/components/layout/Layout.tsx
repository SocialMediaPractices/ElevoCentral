import { useState, ReactNode, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { OnboardingTutorial } from '@/components/onboarding/OnboardingTutorial';
import { useOnboarding } from '@/hooks/use-onboarding';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    showTutorial, 
    hasCompletedTutorial, 
    completeTutorial,
    startTutorial
  } = useOnboarding();

  useEffect(() => {
    // Show tutorial for new users
    if (!hasCompletedTutorial) {
      // Add a slight delay to ensure the UI is fully rendered
      const timer = setTimeout(() => {
        startTutorial();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTutorial, startTutorial]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuToggle={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="main-dashboard flex-1">
          {children}
        </div>
      </div>
      
      {/* Onboarding Tutorial */}
      {showTutorial && (
        <OnboardingTutorial 
          forceShow={showTutorial} 
          onComplete={completeTutorial}
        />
      )}
    </div>
  );
}
