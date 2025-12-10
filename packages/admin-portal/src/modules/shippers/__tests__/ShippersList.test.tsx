/**
 * ShippersList Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShippersList } from '../ShippersList';
import '@testing-library/jest-dom';

describe('ShippersList', () => {
  const mockOnViewShipper = jest.fn();

  beforeEach(() => {
    mockOnViewShipper.mockClear();
  });

  it('renders table with correct columns', async () => {
    render(<ShippersList theme="dark" onViewShipper={mockOnViewShipper} />);
    
    await waitFor(() => {
      expect(screen.getByText('User ID / Role')).toBeInTheDocument();
      expect(screen.getByText('Name & Mobile')).toBeInTheDocument();
      expect(screen.getByText('Franchise')).toBeInTheDocument();
      expect(screen.getByText('City, State')).toBeInTheDocument();
      expect(screen.getByText('Last Active')).toBeInTheDocument();
      expect(screen.getByText('Activity')).toBeInTheDocument();
      expect(screen.getByText('Ledger Balance')).toBeInTheDocument();
      expect(screen.getByText('ACS')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('displays shipper data correctly', async () => {
    render(<ShippersList theme="dark" onViewShipper={mockOnViewShipper} />);
    
    await waitFor(() => {
      expect(screen.getByText('USR-20241')).toBeInTheDocument();
      expect(screen.getByText('Rohit Sharma')).toBeInTheDocument();
      expect(screen.getByText(/Vijayawada/)).toBeInTheDocument();
    });
  });

  it('masks mobile numbers correctly', async () => {
    render(<ShippersList theme="dark" onViewShipper={mockOnViewShipper} />);
    
    await waitFor(() => {
      expect(screen.getByText(/\+91 ••••1234/)).toBeInTheDocument();
    });
  });

  it('displays color-coded ledger balance', async () => {
    render(<ShippersList theme="dark" onViewShipper={mockOnViewShipper} />);
    
    await waitFor(() => {
      // Positive balance in green
      const positiveBalance = screen.getByText(/₹12,500\.50/);
      expect(positiveBalance).toHaveStyle({ color: '#10B981' });
    });
  });

  it('shows ACS flag indicators', async () => {
    render(<ShippersList theme="dark" onViewShipper={mockOnViewShipper} />);
    
    await waitFor(() => {
      const acsIndicators = screen.getAllByText('1');
      expect(acsIndicators.length).toBeGreaterThan(0);
    });
  });

  it('handles search input', async () => {
    render(<ShippersList theme="dark" onViewShipper={mockOnViewShipper} />);
    
    const searchInput = screen.getByPlaceholderText('Search by ID, Name, or Mobile');
    fireEvent.change(searchInput, { target: { value: 'Rohit' } });
    
    expect(searchInput).toHaveValue('Rohit');
  });

  it('handles view action click', async () => {
    render(<ShippersList theme="dark" onViewShipper={mockOnViewShipper} />);
    
    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button');
      const viewButton = viewButtons.find(btn => btn.getAttribute('aria-label')?.includes('eye'));
      if (viewButton) {
        fireEvent.click(viewButton);
        expect(mockOnViewShipper).toHaveBeenCalled();
      }
    });
  });

  it('displays pagination correctly', async () => {
    render(<ShippersList theme="dark" onViewShipper={mockOnViewShipper} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Total.*shippers/)).toBeInTheDocument();
    });
  });

  it('handles filter clearing', async () => {
    render(<ShippersList theme="dark" onViewShipper={mockOnViewShipper} />);
    
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);
    
    // Verify filters are reset
    expect(screen.getByPlaceholderText('Search by ID, Name, or Mobile')).toHaveValue('');
  });
});

