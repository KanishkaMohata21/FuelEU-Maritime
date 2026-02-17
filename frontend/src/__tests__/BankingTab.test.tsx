
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BankingTab } from '../components/BankingTab';
import { apiClient } from '../adapters/infrastructure/api/HttpApiClient';
import { vi } from 'vitest';

// Mock the API Client
// Mock the API Client
vi.mock('../adapters/infrastructure/api/HttpApiClient', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('BankingTab Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<BankingTab />);
        expect(screen.getByText('Banking & Compliance')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g. R004')).toBeInTheDocument();
    });

    it('fetches data when button is clicked', async () => {
        // Mock API responses
        (apiClient.get as any).mockResolvedValueOnce({ cb_gco2eq: 100 }); // Snapshot
        (apiClient.get as any).mockResolvedValueOnce({ adjusted_cb_gco2eq: 100 }); // Adjusted
        (apiClient.get as any).mockResolvedValueOnce([]); // Records

        render(<BankingTab />);

        const shipInput = screen.getByPlaceholderText('e.g. R004');
        const yearInput = screen.getByDisplayValue('2025');
        const fetchBtn = screen.getByText('Fetch Data');

        fireEvent.change(shipInput, { target: { value: 'R004' } });
        fireEvent.click(fetchBtn);

        await waitFor(() => {
            expect(apiClient.get).toHaveBeenCalledWith('/compliance/cb?shipId=R004&year=2025');
        });
    });

    it('banks surplus when action button is clicked', async () => {
        // Setup initial fetched state
        (apiClient.get as any)
            .mockResolvedValueOnce({ cb_gco2eq: 100 })
            .mockResolvedValueOnce({ adjusted_cb_gco2eq: 100 })
            .mockResolvedValueOnce([]);

        render(<BankingTab />);

        // Simulate fetch first to show actions
        fireEvent.change(screen.getByPlaceholderText('e.g. R004'), { target: { value: 'R004' } });
        fireEvent.click(screen.getByText('Fetch Data'));

        await waitFor(() => {
            expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        });

        // Enter amount and bank
        const amountInput = screen.getByPlaceholderText('Amount (gCO₂eq)');
        const bankBtn = screen.getByText('Bank Surplus');

        fireEvent.change(amountInput, { target: { value: '50' } });
        fireEvent.click(bankBtn);

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith('/banking/bank', {
                shipId: 'R004',
                year: 2025,
                amount: 50
            });
        });
    });
});
