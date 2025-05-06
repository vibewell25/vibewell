import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types for A/B testing experiments
type Variant = 'A' | 'B' | 'C' | 'D';

interface Experiment {
  id: string;
  name: string;
  variants: Variant[];
  defaultVariant: Variant;
  weights?: Record<Variant, number>; // Optional weights for non-equal distribution
}

interface ExperimentAssignment {
  experimentId: string;
  assignedVariant: Variant;
}

interface ABTestingContextType {
  // Get the assigned variant for a specific experiment
  getVariant: (experimentId: string) => Variant;
  
  // Track a conversion for the given experiment
  trackConversion: (experimentId: string, conversionType: string, value?: number) => void;
  
  // Track an event for the given experiment
  trackEvent: (experimentId: string, eventName: string, metadata?: Record<string, any>) => void;
  
  // Force a specific variant (useful for testing)
  forceVariant: (experimentId: string, variant: Variant) => void;
  
  // Check if a user is in a specific experiment variant
  isInVariant: (experimentId: string, variant: Variant) => boolean;
  
  // Get all experiment assignments
  assignments: ExperimentAssignment[];
  
  // Check if experiments are loaded
  isLoaded: boolean;
}

// Available experiments configuration
const EXPERIMENTS: Experiment[] = [
  {
    id: 'layout-test-2023',
    name: 'UI Layout Test',
    variants: ['A', 'B'],
    defaultVariant: 'A',
    weights: { A: 0.5, B: 0.5 } // Equal distribution
  },
  {
    id: 'product-page-cta-2023', 
    name: 'Product Page CTA Test',
    variants: ['A', 'B', 'C'],
    defaultVariant: 'A',
    weights: { A: 0.33, B: 0.33, C: 0.34 }
  },
  {
    id: 'checkout-flow-2023',
    name: 'Checkout Flow Test',
    variants: ['A', 'B'],
    defaultVariant: 'A',
    weights: { A: 0.5, B: 0.5 }
  },
  {
    id: 'virtual-tryon-onboarding-2023',
    name: 'Virtual Try-On Onboarding',
    variants: ['A', 'B', 'C', 'D'],
    defaultVariant: 'A',
    weights: { A: 0.25, B: 0.25, C: 0.25, D: 0.25 }
  }
];

// Create context
const ABTestingContext = createContext<ABTestingContextType | undefined>(undefined);

interface ABTestingProviderProps {
  children: ReactNode;
  userId?: string;
  debugMode?: boolean;
}

export function ABTestingProvider({ 
  children, 
  userId,
  debugMode = false 
}: ABTestingProviderProps) {
  const [assignments, setAssignments] = useState<ExperimentAssignment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Initialize experiments
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        // First check for existing assignments in localStorage
        const storedAssignments = localStorage.getItem('ab_test_assignments');
        let userAssignments: ExperimentAssignment[] = [];
        
        if (storedAssignments) {
          userAssignments = JSON.parse(storedAssignments);
        }
        
        // Ensure we have assignments for all current experiments
        const updatedAssignments = EXPERIMENTS.map(experiment => {
          // Try to find existing assignment
          const existingAssignment = userAssignments.find(a => a.experimentId === experiment.id);
          
          if (existingAssignment) {
            return existingAssignment;
          }
          
          // If no existing assignment, create a new one
          return {
            experimentId: experiment.id,
            assignedVariant: assignVariant(experiment)
          };
        });
        
        setAssignments(updatedAssignments);
        
        // Store assignments in localStorage
        localStorage.setItem('ab_test_assignments', JSON.stringify(updatedAssignments));
        
        // Report assignments to analytics
        if (typeof window !== 'undefined' && window.gtag) {
          updatedAssignments.forEach(assignment => {
            window.gtag('event', 'experiment_impression', {
              experiment_id: assignment.experimentId,
              variant: assignment.assignedVariant,
              user_id: userId || 'anonymous'
            });
          });
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error initializing A/B tests:', error);
        // Fallback to default variants if there's an error
        const fallbackAssignments = EXPERIMENTS.map(experiment => ({
          experimentId: experiment.id,
          assignedVariant: experiment.defaultVariant
        }));
        setAssignments(fallbackAssignments);
        setIsLoaded(true);
      }
    };
    
    loadAssignments();
  }, [userId]);
  
  // Debug logging
  useEffect(() => {
    if (debugMode && isLoaded) {
      console.log('A/B Test Assignments:', assignments);
    }
  }, [assignments, debugMode, isLoaded]);
  
  // Assign a variant based on experiment configuration
  const assignVariant = (experiment: Experiment): Variant => {
    // If weights are provided, use them for weighted random assignment
    if (experiment.weights) {
      const random = Math.random();
      let cumulativeProbability = 0;
      
      for (const [variant, weight] of Object.entries(experiment.weights)) {
        cumulativeProbability += weight;
        if (random < cumulativeProbability) {
          return variant as Variant;
        }
      }
    }
    
    // Fallback to random selection from variants
    const randomIndex = Math.floor(Math.random() * experiment.variants.length);
    return experiment.variants[randomIndex];
  };
  
  // Get the variant for a specific experiment
  const getVariant = (experimentId: string): Variant => {
    const assignment = assignments.find(a => a.experimentId === experimentId);
    
    if (assignment) {
      return assignment.assignedVariant;
    }
    
    // If no assignment found, get the default from the experiment config
    const experiment = EXPERIMENTS.find(e => e.id === experimentId);
    return experiment ? experiment.defaultVariant : 'A';
  };
  
  // Track a conversion for an experiment
  const trackConversion = (experimentId: string, conversionType: string, value?: number) => {
    const assignment = assignments.find(a => a.experimentId === experimentId);
    
    if (!assignment) {
      return;
    }
    
    // Report conversion to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'experiment_conversion', {
        experiment_id: experimentId,
        variant: assignment.assignedVariant,
        conversion_type: conversionType,
        value: value || 1,
        user_id: userId || 'anonymous'
      });
    }
  };
  
  // Track a specific event for an experiment
  const trackEvent = (experimentId: string, eventName: string, metadata?: Record<string, any>) => {
    const assignment = assignments.find(a => a.experimentId === experimentId);
    
    if (!assignment) {
      return;
    }
    
    // Report event to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        experiment_id: experimentId,
        variant: assignment.assignedVariant,
        user_id: userId || 'anonymous',
        ...metadata
      });
    }
  };
  
  // Force a specific variant (useful for testing)
  const forceVariant = (experimentId: string, variant: Variant) => {
    setAssignments(prev => {
      const newAssignments = prev.map(a => 
        a.experimentId === experimentId 
          ? { ...a, assignedVariant: variant }
          : a
      );
      
      // Update localStorage
      localStorage.setItem('ab_test_assignments', JSON.stringify(newAssignments));
      return newAssignments;
    });
  };
  
  // Check if a user is in a specific experiment variant
  const isInVariant = (experimentId: string, variant: Variant): boolean => {
    return getVariant(experimentId) === variant;
  };
  
  const contextValue: ABTestingContextType = {
    getVariant,
    trackConversion,
    trackEvent,
    forceVariant,
    isInVariant,
    assignments,
    isLoaded
  };
  
  return (
    <ABTestingContext.Provider value={contextValue}>
      {children}
    </ABTestingContext.Provider>
  );
}

// Hook for using A/B testing in components
export function useABTesting() {
  const context = useContext(ABTestingContext);
  
  if (context === undefined) {
    throw new Error('useABTesting must be used within an ABTestingProvider');
  }
  
  return context;
}

// For TypeScript global window
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, any>) => void;
  }
}

export default ABTestingProvider; 