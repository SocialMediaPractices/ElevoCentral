import { useState, useCallback, useEffect } from 'react';
import { TutorialStep } from '@/components/onboarding/OnboardingTutorial';

export function useOnboarding(customSteps?: TutorialStep[]) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);
  const [steps, setSteps] = useState<TutorialStep[]>([]);

  useEffect(() => {
    // Check if tutorial has been completed before
    const completed = localStorage.getItem('hasCompletedTutorial') === 'true';
    setHasCompletedTutorial(completed);
    
    // If custom steps are provided, use them
    if (customSteps) {
      setSteps(customSteps);
    }
  }, [customSteps]);

  const startTutorial = useCallback(() => {
    setShowTutorial(true);
  }, []);

  const completeTutorial = useCallback(() => {
    setShowTutorial(false);
    setHasCompletedTutorial(true);
    localStorage.setItem('hasCompletedTutorial', 'true');
  }, []);

  const resetTutorial = useCallback(() => {
    localStorage.removeItem('hasCompletedTutorial');
    setHasCompletedTutorial(false);
  }, []);

  return {
    showTutorial,
    hasCompletedTutorial,
    steps,
    startTutorial,
    completeTutorial,
    resetTutorial,
    setSteps,
  };
}

export default useOnboarding;