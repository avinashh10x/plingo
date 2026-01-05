import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  LayoutDashboard, 
  Calendar, 
  PenTool, 
  Users, 
  Settings,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { createPortal } from 'react-dom';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to Plingo!',
    description: 'Your all-in-one social media scheduling platform. Let us show you around.',
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    title: 'Dashboard Overview',
    description: 'Get a quick glance at your scheduled posts, drafts, and connected accounts.',
    icon: <LayoutDashboard className="h-6 w-6" />,
    targetSelector: '[data-tour="dashboard"]',
    position: 'right',
  },
  {
    title: 'Content Studio',
    description: 'Create beautiful posts with our rich editor and AI assistant.',
    icon: <PenTool className="h-6 w-6" />,
    targetSelector: '[data-tour="studio"]',
    position: 'right',
  },
  {
    title: 'Calendar View',
    description: 'Visualize your content schedule and plan ahead.',
    icon: <Calendar className="h-6 w-6" />,
    targetSelector: '[data-tour="calendar"]',
    position: 'right',
  },
  {
    title: 'Connect Platforms',
    description: 'Link your social media accounts to start publishing.',
    icon: <Users className="h-6 w-6" />,
    targetSelector: '[data-tour="accounts"]',
    position: 'right',
  },
  {
    title: 'Customize Settings',
    description: 'Personalize your experience with themes and preferences.',
    icon: <Settings className="h-6 w-6" />,
    targetSelector: '[data-tour="settings"]',
    position: 'right',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour = ({ onComplete, onSkip }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const hasTarget = !!step.targetSelector;

  // Find target element and get its position
  useEffect(() => {
    if (step.targetSelector) {
      const target = document.querySelector(step.targetSelector);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll into view if needed
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep, step.targetSelector]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || !hasTarget) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const position = step.position || 'right';

    switch (position) {
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: 'translateY(-50%)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          right: window.innerWidth - targetRect.left + padding,
          transform: 'translateY(-50%)',
        };
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'top':
        return {
          bottom: window.innerHeight - targetRect.top + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  // Arrow position based on tooltip position
  const getArrowStyle = (): React.CSSProperties => {
    const position = step.position || 'right';
    
    switch (position) {
      case 'right':
        return {
          left: -8,
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
        };
      case 'left':
        return {
          right: -8,
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
        };
      case 'bottom':
        return {
          top: -8,
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
        };
      case 'top':
        return {
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
        };
      default:
        return {};
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100]"
    >
      {/* Backdrop overlay - split into 4 parts around the spotlight */}
      {targetRect && hasTarget ? (
        <>
          {/* Top overlay */}
          <div 
            className="absolute bg-black/70" 
            style={{ 
              top: 0, 
              left: 0, 
              right: 0, 
              height: Math.max(0, targetRect.top - 8) 
            }} 
          />
          {/* Left overlay */}
          <div 
            className="absolute bg-black/70" 
            style={{ 
              top: targetRect.top - 8, 
              left: 0, 
              width: Math.max(0, targetRect.left - 8),
              height: targetRect.height + 16 
            }} 
          />
          {/* Right overlay */}
          <div 
            className="absolute bg-black/70" 
            style={{ 
              top: targetRect.top - 8, 
              left: targetRect.right + 8, 
              right: 0,
              height: targetRect.height + 16 
            }} 
          />
          {/* Bottom overlay */}
          <div 
            className="absolute bg-black/70" 
            style={{ 
              top: targetRect.bottom + 8, 
              left: 0, 
              right: 0, 
              bottom: 0 
            }} 
          />
          {/* Spotlight highlight ring */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute pointer-events-none z-[101]"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              borderRadius: 12,
              border: '2px solid hsl(var(--primary))',
              boxShadow: '0 0 20px hsl(var(--primary) / 0.5)',
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          ref={tooltipRef}
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[101] bg-card border border-border rounded-xl shadow-2xl w-80"
          style={getTooltipStyle()}
        >
          {/* Arrow */}
          {hasTarget && targetRect && (
            <div 
              className="absolute w-4 h-4 bg-card border-l border-t border-border"
              style={getArrowStyle()}
            />
          )}

          {/* Progress dots */}
          <div className="p-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-1.5">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-5 bg-primary'
                      : index < currentStep
                      ? 'w-1.5 bg-primary/50'
                      : 'w-1.5 bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} / {tourSteps.length}
            </span>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  className="gap-1 h-8"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSkip}
                className="h-8 text-muted-foreground"
              >
                Skip
              </Button>
              <Button 
                size="sm" 
                onClick={handleNext} 
                className="gap-1 h-8"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ChevronRight className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Close button in corner */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-[102] h-8 w-8 bg-card/50 backdrop-blur-sm hover:bg-card"
        onClick={onSkip}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );

  return createPortal(content, document.body);
};
