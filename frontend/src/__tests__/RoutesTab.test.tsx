
import { render, screen, waitFor } from '@testing-library/react';
import { RoutesTab } from '../components/RoutesTab';
import { apiClient } from '../adapters/infrastructure/api/HttpApiClient';
import { vi } from 'vitest';

// Mock API Client
vi.mock('../adapters/infrastructure/api/HttpApiClient', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('RoutesTab Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        // Delay response to check loading
        (apiClient.get as any).mockReturnValue(new Promise(() => { }));
        render(<RoutesTab />);
        expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    it('renders routes table after fetch', async () => {
        const mockRoutes = [
            { route_id: 'R001', vesselType: 'RoRo', from: 'Hamburg', to: 'Oslo', distance: 500, fuelConsumption: 100, fuelType: 'HFO', year: 2025, ghg_intensity: 89.2, totalEmissions: 300, is_baseline: false }
        ];
        (apiClient.get as any).mockResolvedValue(mockRoutes);

        render(<RoutesTab />);

        await waitFor(() => {
            expect(screen.getByText('R001')).toBeInTheDocument();
            expect(screen.getByText('RoRo')).toBeInTheDocument();
        });
    });

    it('renders empty state if no routes', async () => {
        (apiClient.get as any).mockResolvedValue([]);
        render(<RoutesTab />);

        await waitFor(() => {
            expect(screen.getByText('No routes found.')).toBeInTheDocument();
        });
    });
});
