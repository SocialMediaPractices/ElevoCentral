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
    description: 'This tutorial will guide you through the main features of our application.',
    target: '.main-dashboard',
    position: 'bottom',
    dismissable: true,
  },
  {
    id: 2,
    title: 'Dashboard Overview',
    description: 'The dashboard gives you an overview of today\'s activities, staff, and announcements.',
    target: '.stats-cards',
    position: 'bottom',
  },
  {
    id: 3,
    title: 'Activities',
    description: 'View before-school and after-school activities. Click on any activity to see details.',
    target: '.activities-section',
    position: 'right',
  },
  {
    id: 4,
    title: 'Staff Members',
    description: 'See which staff members are available today and what activities they\'re assigned to.',
    target: '.staff-section',
    position: 'left',
  },
  {
    id: 5,
    title: 'Announcements',
    description: 'Stay updated with the latest announcements and important information.',
    target: '.announcements-section',
    position: 'top',
  },
  {
    id: 6,
    title: 'Navigation',
    description: 'Use the sidebar to navigate between different sections of the application.',
    target: '.main-sidebar',
    position: 'right',
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