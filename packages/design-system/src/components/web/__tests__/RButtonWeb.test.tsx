/**
 * RButtonWeb Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { RButtonWeb } from '../RButtonWeb';

describe('RButtonWeb', () => {
  it('renders with children', () => {
    render(<RButtonWeb>Click Me</RButtonWeb>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<RButtonWeb onClick={handleClick}>Click Me</RButtonWeb>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <RButtonWeb onClick={handleClick} disabled>
        Click Me
      </RButtonWeb>
    );
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies primary variant styles', () => {
    const { container } = render(<RButtonWeb variant="primary">Primary</RButtonWeb>);
    const button = container.querySelector('button');
    expect(button).toHaveStyle({ backgroundColor: '#C90D0D' });
  });

  it('applies secondary variant styles', () => {
    const { container } = render(<RButtonWeb variant="secondary">Secondary</RButtonWeb>);
    const button = container.querySelector('button');
    expect(button).toHaveStyle({ border: expect.stringContaining('#C90D0D') });
  });
});

