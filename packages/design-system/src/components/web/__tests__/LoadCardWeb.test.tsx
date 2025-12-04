/**
 * LoadCardWeb Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { LoadCardWeb } from '../LoadCardWeb';

const mockLoad = {
  id: 'BKG-001',
  pickup: {
    address: '123 Main St',
    city: 'Bangalore',
    state: 'Karnataka',
  },
  drop: {
    address: '456 Park Ave',
    city: 'Chennai',
    state: 'Tamil Nadu',
  },
  tonnage: 15,
  priceRange: {
    min: 20000,
    max: 30000,
  },
  status: 'OPEN_FOR_BIDDING' as const,
  bidCount: 5,
};

describe('LoadCardWeb', () => {
  it('renders load information', () => {
    render(<LoadCardWeb {...mockLoad} />);
    expect(screen.getByText(/Load #/)).toBeInTheDocument();
    expect(screen.getByText(/Bangalore/)).toBeInTheDocument();
    expect(screen.getByText(/Chennai/)).toBeInTheDocument();
    expect(screen.getByText(/15 tons/)).toBeInTheDocument();
  });

  it('displays bid count when provided', () => {
    render(<LoadCardWeb {...mockLoad} />);
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<LoadCardWeb {...mockLoad} onClick={handleClick} />);
    const card = screen.getByText(/Load #/).closest('div');
    if (card) {
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });
});

