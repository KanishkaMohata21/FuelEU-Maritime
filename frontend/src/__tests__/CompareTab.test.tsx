
import { render, screen, waitFor } from '@testing-library/react';
import { CompareTab } from '../components/CompareTab';
import { apiClient } from '../adapters/infrastructure/api/HttpApiClient';
import { vi } from 'vitest';

// Mock API Client
vi.mock('../adapters/infrastructure/api/HttpApiClient', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('CompareTab Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and displays comparison data on mount', async () => {
        const mockComparisons = [{
            route: { route_id: 'R001', ghg_intensity: 88.5, is_baseline: false },
            percentDiff: -1.0,
            compliant: true
        }];
        (apiClient.get as any).mockResolvedValue(mockComparisons);

        render(<CompareTab />);

        // expect(screen.getByText(/Loading/i)).toBeInTheDocument(); 
        // Component uses shimmer, checking for data load instead

        await waitFor(() => {
            expect(apiClient.get).toHaveBeenCalledWith('/routes/comparison');
            expect(screen.getByText('R001')).toBeInTheDocument();
            const compliantElements = screen.getAllByText(/Compliant/);
            expect(compliantElements.length).toBeGreaterThan(0);
        });
    });

    it('renders empty state if no comparisons', async () => {
        (apiClient.get as any).mockResolvedValue([]);
        render(<CompareTab />);

        await waitFor(() => {
            expect(screen.getByText(/No comparison data available/i)).toBeInTheDocument();
        });
    });
});
