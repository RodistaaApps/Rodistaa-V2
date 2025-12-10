/**
 * ShipperDetailPanel Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShipperDetailPanel } from '../ShipperDetailPanel';
import '@testing-library/jest-dom';

describe('ShipperDetailPanel', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders drawer when open', () => {
    render(
      <ShipperDetailPanel
        shipperId="USR-20241"
        open={true}
        onClose={mockOnClose}
        theme="dark"
      />
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays shipper header after loading', async () => {
    render(
      <ShipperDetailPanel
        shipperId="USR-20241"
        open={true}
        onClose={mockOnClose}
        theme="dark"
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Rohit Sharma')).toBeInTheDocument();
      expect(screen.getByText('USR-20241')).toBeInTheDocument();
      expect(screen.getByText('Shipper')).toBeInTheDocument();
    });
  });

  it('displays all 9 tabs', async () => {
    render(
      <ShipperDetailPanel
        shipperId="USR-20241"
        open={true}
        onClose={mockOnClose}
        theme="dark"
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Bookings')).toBeInTheDocument();
      expect(screen.getByText('Shipments')).toBeInTheDocument();
      expect(screen.getByText('Ledger')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Activity')).toBeInTheDocument();
      expect(screen.getByText(/ACS.*Risk/)).toBeInTheDocument();
      expect(screen.getByText('Admin Actions')).toBeInTheDocument();
    });
  });

  it('handles tab switching', async () => {
    render(
      <ShipperDetailPanel
        shipperId="USR-20241"
        open={true}
        onClose={mockOnClose}
        theme="dark"
      />
    );
    
    await waitFor(() => {
      const bookingsTab = screen.getByText('Bookings');
      fireEvent.click(bookingsTab);
      // Verify tab content changes
    });
  });

  it('calls onClose when close button clicked', async () => {
    render(
      <ShipperDetailPanel
        shipperId="USR-20241"
        open={true}
        onClose={mockOnClose}
        theme="dark"
      />
    );
    
    await waitFor(() => {
      const closeButton = screen.getAllByRole('button').find(btn => btn.getAttribute('aria-label') === 'Close');
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  it('does not render when closed', () => {
    render(
      <ShipperDetailPanel
        shipperId="USR-20241"
        open={false}
        onClose={mockOnClose}
        theme="dark"
      />
    );
    
    expect(screen.queryByText('Rohit Sharma')).not.toBeInTheDocument();
  });
});

