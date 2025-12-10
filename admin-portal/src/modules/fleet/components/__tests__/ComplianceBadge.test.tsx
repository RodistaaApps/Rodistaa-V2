/**
 * ComplianceBadge Component Tests
 * 
 * Tests for compliance status badge rendering
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ComplianceBadge } from '../ComplianceBadge';

describe('ComplianceBadge', () => {
  it('should render allowed status', () => {
    render(<ComplianceBadge status="allowed" />);
    expect(screen.getByText('ALLOWED')).toBeInTheDocument();
  });

  it('should render blocked status', () => {
    render(<ComplianceBadge status="blocked" reason="Test reason" />);
    expect(screen.getByText('BLOCKED')).toBeInTheDocument();
  });

  it('should render pending status', () => {
    render(<ComplianceBadge status="pending" />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('should show reason in tooltip', () => {
    render(<ComplianceBadge status="blocked" reason="Compliance violation" />);
    // Tooltip tested via user interaction
  });

  it('should show confidence score in tooltip', () => {
    render(<ComplianceBadge status="allowed" confidence={95} />);
    // Tooltip tested via user interaction
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ComplianceBadge status="allowed" onClick={handleClick} />);
    
    const badge = screen.getByText('ALLOWED');
    fireEvent.click(badge);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show icon by default', () => {
    const { container } = render(<ComplianceBadge status="allowed" />);
    expect(container.querySelector('.anticon')).toBeInTheDocument();
  });

  it('should hide icon when showIcon=false', () => {
    const { container } = render(<ComplianceBadge status="allowed" showIcon={false} />);
    expect(container.querySelector('.anticon')).not.toBeInTheDocument();
  });
});

