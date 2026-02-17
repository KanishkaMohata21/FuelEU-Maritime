
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PoolingTab } from '../PoolingTab';
import { apiClient } from '../../adapters/infrastructure/api/HttpApiClient';
import { vi } from 'vitest';

// Mock API Client
vi.mock('../../adapters/infrastructure/api/HttpApiClient', () => ({
    apiClient: {
        post: vi.fn(),
    },
}));

describe('PoolingTab Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders initial state', () => {
        render(<PoolingTab />);
        expect(screen.getByText('Pooling')).toBeInTheDocument();
        expect(screen.getByText('Create Pool')).toBeInTheDocument();
    });

    it('creates pool and displays results', async () => {
        const mockResults = [
            { shipId: 'S1', cb_before: 100, cb_after: 50, role: 'Donor' },
            { shipId: 'S2', cb_before: -50, cb_after: 0, role: 'Receiver' }
        ];
        (apiClient.post as any).mockResolvedValue(mockResults);

        render(<PoolingTab />);

        const yearInput = screen.getByDisplayValue('2025');
        const shipsInput = screen.getByPlaceholderText('R004, R005');
        const createBtn = screen.getByText('Create Pool');

        fireEvent.change(shipsInput, { target: { value: 'S1, S2' } });
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith('/pools', {
                year: 2025,
                shipIds: ['S1', 'S2']
            });
            expect(screen.getByText('Allocation Results')).toBeInTheDocument();
            expect(screen.getByText('Donor')).toBeInTheDocument();
            expect(screen.getByText('Receiver')).toBeInTheDocument();
        });
    });
});
