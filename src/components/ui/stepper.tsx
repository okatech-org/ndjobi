import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index < currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    'relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all',
                    isCompleted && 'bg-primary border-primary text-white',
                    isCurrent && 'border-primary bg-white text-primary',
                    !isCompleted && !isCurrent && 'border-muted bg-white text-muted-foreground',
                    isClickable && 'cursor-pointer hover:border-primary hover:scale-105',
                    !isClickable && 'cursor-default'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <span className="text-sm sm:text-base font-semibold">
                      {index + 1}
                    </span>
                  )}
                </button>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-xs sm:text-sm font-medium',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-primary',
                      !isCompleted && !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="hidden sm:block text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'hidden sm:block flex-1 h-0.5 mx-2 transition-all',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                  style={{ marginTop: '-2.5rem' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

interface StepperNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
}

export const StepperNavigation: React.FC<StepperNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isLoading = false,
  canGoNext = true,
  canGoPrevious = true,
  previousLabel = 'Précédent',
  nextLabel = 'Suivant',
  submitLabel = 'Soumettre',
}) => {
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="flex items-center justify-between gap-4 pt-6 border-t">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep || !canGoPrevious || isLoading}
        className={cn(
          'px-4 py-2 rounded-md font-medium transition-all',
          'border border-gray-300 hover:bg-gray-50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isFirstStep && 'invisible'
        )}
      >
        {previousLabel}
      </button>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-primary">{currentStep + 1}</span>
        <span>/</span>
        <span>{totalSteps}</span>
      </div>

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canGoNext || isLoading}
          className={cn(
            'px-6 py-2 rounded-md font-medium transition-all',
            'bg-primary text-white hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center gap-2'
          )}
        >
          {isLoading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {submitLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className={cn(
            'px-6 py-2 rounded-md font-medium transition-all',
            'bg-primary text-white hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
};

