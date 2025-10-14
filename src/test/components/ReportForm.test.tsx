import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReportForm } from '@/components/dashboard/user/ReportForm';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        error: null
      }))
    }))
  }
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock geolocation
const mockGetCurrentPosition = vi.fn();
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: mockGetCurrentPosition,
  },
  writable: true,
});

// Composant wrapper pour les tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ReportForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentPosition.mockClear();
  });

  const renderReportForm = () => {
    return render(
      <TestWrapper>
        <ReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      </TestWrapper>
    );
  };

  describe('Rendu initial', () => {
    it('devrait afficher le formulaire de signalement', () => {
      renderReportForm();

      expect(screen.getByText('Taper le Ndjobi')).toBeInTheDocument();
      expect(screen.getByText('Votre dénonciation restera 100% confidentielle')).toBeInTheDocument();
      expect(screen.getByLabelText('Type de corruption')).toBeInTheDocument();
      expect(screen.getByLabelText('Lieu des faits')).toBeInTheDocument();
      expect(screen.getByLabelText('Description détaillée')).toBeInTheDocument();
    });

    it('devrait afficher le mode anonyme par défaut', () => {
      renderReportForm();

      const anonymousCheckbox = screen.getByLabelText('Rester anonyme (recommandé)');
      expect(anonymousCheckbox).toBeChecked();
    });

    it('devrait afficher les onglets de localisation', () => {
      renderReportForm();

      expect(screen.getByText('Saisie manuelle')).toBeInTheDocument();
      expect(screen.getByText('Géolocalisation')).toBeInTheDocument();
    });
  });

  describe('Validation du formulaire', () => {
    it('devrait afficher des erreurs pour les champs requis', async () => {
      const user = userEvent.setup();
      renderReportForm();

      const submitButton = screen.getByRole('button', { name: /taper le ndjobi/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Sélectionnez un type de signalement')).toBeInTheDocument();
        expect(screen.getByText('Veuillez indiquer le lieu')).toBeInTheDocument();
        expect(screen.getByText('Description trop courte (minimum 10 caractères)')).toBeInTheDocument();
      });
    });

    it('devrait valider la longueur minimale de la description', async () => {
      const user = userEvent.setup();
      renderReportForm();

      const descriptionField = screen.getByLabelText('Description détaillée');
      await user.type(descriptionField, 'Court');

      const submitButton = screen.getByRole('button', { name: /taper le ndjobi/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Description trop courte (minimum 10 caractères)')).toBeInTheDocument();
      });
    });

    it('devrait valider la longueur maximale de la description', async () => {
      const user = userEvent.setup();
      renderReportForm();

      const descriptionField = screen.getByLabelText('Description détaillée');
      const longText = 'x'.repeat(5001);
      await user.type(descriptionField, longText);

      const submitButton = screen.getByRole('button', { name: /taper le ndjobi/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Description trop longue (maximum 5000 caractères)')).toBeInTheDocument();
      });
    });
  });

  describe('Types de corruption', () => {
    it('devrait afficher tous les types de corruption disponibles', async () => {
      const user = userEvent.setup();
      renderReportForm();

      const typeSelect = screen.getByLabelText('Type de corruption');
      await user.click(typeSelect);

      await waitFor(() => {
        expect(screen.getByText('Extorsion')).toBeInTheDocument();
        expect(screen.getByText('Détournement de fonds')).toBeInTheDocument();
        expect(screen.getByText('Pot-de-vin')).toBeInTheDocument();
        expect(screen.getByText('Abus de pouvoir')).toBeInTheDocument();
        expect(screen.getByText('Népotisme')).toBeInTheDocument();
        expect(screen.getByText('Fraude')).toBeInTheDocument();
        expect(screen.getByText('Autre')).toBeInTheDocument();
      });
    });
  });

  describe('Géolocalisation', () => {
    it('devrait permettre de détecter la position GPS', async () => {
      const user = userEvent.setup();
      renderReportForm();

      // Passer à l'onglet géolocalisation
      const geoTab = screen.getByText('Géolocalisation');
      await user.click(geoTab);

      // Mock une position GPS réussie
      mockGetCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 0.3901,
            longitude: 9.4544
          }
        });
      });

      // Mock fetch pour l'API de géocodage inverse
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          display_name: 'Libreville, Gabon',
          address: {
            city: 'Libreville',
            country: 'Gabon'
          }
        })
      });

      const detectButton = screen.getByText('Détecter ma position');
      await user.click(detectButton);

      await waitFor(() => {
        expect(mockGetCurrentPosition).toHaveBeenCalled();
      });
    });

    it('devrait gérer les erreurs de géolocalisation', async () => {
      const user = userEvent.setup();
      renderReportForm();

      // Passer à l'onglet géolocalisation
      const geoTab = screen.getByText('Géolocalisation');
      await user.click(geoTab);

      // Mock une erreur de géolocalisation
      mockGetCurrentPosition.mockImplementation((success, error) => {
        error({ code: 1, message: 'Permission denied' });
      });

      const detectButton = screen.getByText('Détecter ma position');
      await user.click(detectButton);

      await waitFor(() => {
        expect(mockGetCurrentPosition).toHaveBeenCalled();
      });
    });
  });

  describe('Mode anonyme', () => {
    it('devrait masquer les champs d\'identité en mode anonyme', () => {
      renderReportForm();

      // Les champs nom et contact ne doivent pas être visibles par défaut
      expect(screen.queryByLabelText('Nom (optionnel)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Contact (optionnel)')).not.toBeInTheDocument();
    });

    it('devrait afficher les champs d\'identité en mode non-anonyme', async () => {
      const user = userEvent.setup();
      renderReportForm();

      const anonymousCheckbox = screen.getByLabelText('Rester anonyme (recommandé)');
      await user.click(anonymousCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('Nom (optionnel)')).toBeInTheDocument();
        expect(screen.getByLabelText('Contact (optionnel)')).toBeInTheDocument();
      });
    });
  });

  describe('Soumission du formulaire', () => {
    it('devrait soumettre un signalement valide', async () => {
      const user = userEvent.setup();
      renderReportForm();

      // Remplir le formulaire
      const typeSelect = screen.getByLabelText('Type de corruption');
      await user.click(typeSelect);
      await user.click(screen.getByText('Extorsion'));

      const locationField = screen.getByLabelText('Lieu des faits');
      await user.type(locationField, 'Libreville, Gabon');

      const descriptionField = screen.getByLabelText('Description détaillée');
      await user.type(descriptionField, 'Description détaillée du cas de corruption observé');

      // Mock de Supabase pour une insertion réussie
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any).mockImplementation(mockFrom);

      const submitButton = screen.getByRole('button', { name: /taper le ndjobi/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith('signalements');
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'extorsion',
            location: 'Libreville, Gabon',
            description: 'Description détaillée du cas de corruption observé',
            anonymous: true,
            status: 'pending'
          })
        );
      });
    });

    it('devrait gérer les erreurs de soumission', async () => {
      const user = userEvent.setup();
      renderReportForm();

      // Remplir le formulaire
      const typeSelect = screen.getByLabelText('Type de corruption');
      await user.click(typeSelect);
      await user.click(screen.getByText('Fraude'));

      const locationField = screen.getByLabelText('Lieu des faits');
      await user.type(locationField, 'Test location');

      const descriptionField = screen.getByLabelText('Description détaillée');
      await user.type(descriptionField, 'Test description avec assez de caractères');

      // Mock d'une erreur Supabase
      const mockInsert = vi.fn().mockResolvedValue({ 
        error: new Error('Erreur de base de données') 
      });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any).mockImplementation(mockFrom);

      const submitButton = screen.getByRole('button', { name: /taper le ndjobi/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled();
      });
    });
  });

  describe('Callbacks', () => {
    it('devrait appeler onCancel quand le bouton Annuler est cliqué', async () => {
      const user = userEvent.setup();
      renderReportForm();

      const cancelButton = screen.getByText('Annuler');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});
