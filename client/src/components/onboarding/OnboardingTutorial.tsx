import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define the tutorial steps
export type TutorialStep = {
  id: number;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'right' | 'bottom' | 'left';
  dismissable?: boolean; // Can this step be skipped?
  action?: string; // Text for an action button
};

const defaultSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Welcome to Elevo Central',
    description: 'This is your comprehensive after-school program management platform. Elevo Central helps you coordinate activities, manage staff, track student behavior, and communicate with parents all in one place.',
    target: '.main-dashboard',
    position: 'bottom',
    dismissable: true,
  },
  {
    id: 2,
    title: 'Your Program at a Glance',
    description: 'The dashboard gives you real-time insights into your program\'s key metrics. Monitor student attendance, scheduled activities, available staff, and important announcements instantly.',
    target: '.stats-cards',
    position: 'bottom',
  },
  {
    id: 3,
    title: 'Before & After School Activities',
    description: 'Easily manage both morning and afternoon programs. View schedules, assign staff, track attendance, and ensure appropriate supervision for all activities.',
    target: '.activities-section',
    position: 'right',
  },
  {
    id: 4,
    title: 'Staff Management',
    description: 'Track which staff members are on duty, their specialties, and assigned activities. Elevo helps ensure proper staff-to-student ratios and appropriate supervision.',
    target: '.staff-section',
    position: 'left',
  },
  {
    id: 5,
    title: 'Program Announcements',
    description: 'Keep everyone informed with important updates. Announcements automatically reach staff, students, and parents based on their roles and affected programs.',
    target: '.announcements-section',
    position: 'top',
  },
  {
    id: 6,
    title: 'Complete Program Management',
    description: 'Use the sidebar to access all program areas including student behavior tracking, parent communications, homework management, and scheduling tools.',
    target: '.main-sidebar',
    position: 'right',
  },
  {
    id: 7,
    title: 'Role-Based Access',
    description: 'Elevo Central provides different features based on your role. Site Managers see everything, Youth Development Leads focus on behavior and inventory, while coaches access homework and student information.',
    target: '.main-dashboard',
    position: 'bottom',
  },
  {
    id: 8,
    title: 'Ready to Begin',
    description: 'You\'re all set to efficiently manage your after-school programs! Remember you can revisit this tutorial from the Help section anytime.',
    target: '.main-dashboard',
    position: 'bottom',
    action: 'Get Started',
  },
];

interface OnboardingTutorialProps {
  steps?: TutorialStep[];
  onComplete?: () => void;
  forceShow?: boolean;
}

export const OnboardingTutorial = ({
  steps = defaultSteps,
  onComplete,
  forceShow = false,
}: OnboardingTutorialProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    // Check if this is the first time the user is visiting
    const hasSeenTutorial = localStorage.getItem('hasCompletedTutorial');
    
    if (!hasSeenTutorial || forceShow) {
      // Delay showing the tutorial to allow the page to fully render
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  useEffect(() => {
    if (!visible || currentStep >= steps.length) return;
    
    const step = steps[currentStep];
    const target = document.querySelector(step.target) as HTMLElement;
    setTargetElement(target);
    
    if (target) {
      const rect = target.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [currentStep, steps, visible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  const completeTutorial = () => {
    setVisible(false);
    localStorage.setItem('hasCompletedTutorial', 'true');
    if (onComplete) onComplete();
  };

  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%' };
    
    const step = steps[currentStep];
    const padding = 15; // Space between target and tooltip
    
    let top = 0;
    let left = 0;
    
    switch (step.position) {
      case 'top':
        top = position.top - padding;
        left = position.left + position.width / 2;
        return { top: `${top}px`, left: `${left}px`, transform: 'translate(-50%, -100%)' };
      case 'right':
        top = position.top + position.height / 2;
        left = position.left + position.width + padding;
        return { top: `${top}px`, left: `${left}px`, transform: 'translateY(-50%)' };
      case 'bottom':
        top = position.top + position.height + padding;
        left = position.left + position.width / 2;
        return { top: `${top}px`, left: `${left}px`, transform: 'translateX(-50%)' };
      case 'left':
        top = position.top + position.height / 2;
        left = position.left - padding;
        return { top: `${top}px`, left: `${left}px`, transform: 'translate(-100%, -50%)' };
      default:
        return { top: '50%', left: '50%' };
    }
  };

  // If tutorial is not visible or there are no steps, don't render anything
  if (!visible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-50"
        onClick={currentStepData.dismissable ? handleSkip : undefined}
      />
      
      {/* Target Highlight */}
      {targetElement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute z-50 border-2 border-primary rounded-md"
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-[350px]"
          style={{
            ...getTooltipPosition(),
            pointerEvents: 'auto',
          }}
        >
          {/* Close button */}
          {currentStepData.dismissable && (
            <button 
              onClick={handleSkip} 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close tutorial"
            >
              <X size={16} />
            </button>
          )}
          
          {/* Content */}
          <h3 className="font-semibold text-lg mb-2">{currentStepData.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{currentStepData.description}</p>
          
          {/* Navigation */}
          <div className="flex justify-between items-center">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
            <div className="flex-1" />
            
            {currentStepData.dismissable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="mr-2"
              >
                Skip
              </Button>
            )}
            
            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
            >
              {isLastStep ? 'Finish' : 'Next'}
            </Button>
          </div>
          
          {/* Progress indicator */}
          <div className="flex mt-4 justify-center space-x-1">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 rounded-full ${
                  index === currentStep ? 'w-4 bg-primary' : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default OnboardingTutorial;