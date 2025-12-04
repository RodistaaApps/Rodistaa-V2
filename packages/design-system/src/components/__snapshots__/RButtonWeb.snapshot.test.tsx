/**
 * RButtonWeb Snapshot Tests
 */

import { render } from '@testing-library/react';
import { RButtonWeb } from '../web/RButtonWeb';

describe('RButtonWeb Snapshots', () => {
  it('matches snapshot for primary variant', () => {
    const { container } = render(<RButtonWeb variant="primary">Primary</RButtonWeb>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for secondary variant', () => {
    const { container } = render(<RButtonWeb variant="secondary">Secondary</RButtonWeb>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for disabled state', () => {
    const { container } = render(<RButtonWeb disabled>Disabled</RButtonWeb>);
    expect(container.firstChild).toMatchSnapshot();
  });
});

