import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Stepper, StepperNavigation } from '@/components/ui/stepper';

describe('Stepper', () => {
  const mockSteps = [
    { id: 'step1', label: 'Étape 1', description: 'Première étape' },
    { id: 'step2', label: 'Étape 2', description: 'Deuxième étape' },
    { id: 'step3', label: 'Étape 3', description: 'Troisième étape' },
  ];

  it('affiche tous les steps correctement', () => {
    render(<Stepper steps={mockSteps} currentStep={0} />);
    
    expect(screen.getByText('Étape 1')).toBeInTheDocument();
    expect(screen.getByText('Étape 2')).toBeInTheDocument();
    expect(screen.getByText('Étape 3')).toBeInTheDocument();
  });

  it('met en évidence le step actuel', () => {
    const { container } = render(<Stepper steps={mockSteps} currentStep={1} />);
    const currentStepElement = container.querySelector('button:nth-child(3)');
    expect(currentStepElement).toHaveClass('border-primary');
  });

  it('permet de cliquer sur les steps précédents', () => {
    const mockOnStepClick = vi.fn();
    render(
      <Stepper 
        steps={mockSteps} 
        currentStep={2} 
        onStepClick={mockOnStepClick}
      />
    );
    
    const firstStepButton = screen.getByText('1');
    fireEvent.click(firstStepButton);
    
    expect(mockOnStepClick).toHaveBeenCalledWith(0);
  });
});

describe('StepperNavigation', () => {
  it('affiche les boutons Précédent et Suivant correctement', () => {
    render(
      <StepperNavigation
        currentStep={1}
        totalSteps={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );
    
    expect(screen.getByText('Précédent')).toBeInTheDocument();
    expect(screen.getByText('Suivant')).toBeInTheDocument();
  });

  it('désactive le bouton Précédent sur le premier step', () => {
    render(
      <StepperNavigation
        currentStep={0}
        totalSteps={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );
    
    const previousButton = screen.getByText('Précédent');
    expect(previousButton).toBeDisabled();
  });

  it('affiche le bouton Soumettre sur le dernier step', () => {
    render(
      <StepperNavigation
        currentStep={2}
        totalSteps={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onSubmit={vi.fn()}
        submitLabel="Envoyer"
      />
    );
    
    expect(screen.getByText('Envoyer')).toBeInTheDocument();
    expect(screen.queryByText('Suivant')).not.toBeInTheDocument();
  });

  it('appelle onNext quand on clique sur Suivant', () => {
    const mockOnNext = vi.fn();
    render(
      <StepperNavigation
        currentStep={0}
        totalSteps={3}
        onPrevious={vi.fn()}
        onNext={mockOnNext}
      />
    );
    
    const nextButton = screen.getByText('Suivant');
    fireEvent.click(nextButton);
    
    expect(mockOnNext).toHaveBeenCalled();
  });
});

