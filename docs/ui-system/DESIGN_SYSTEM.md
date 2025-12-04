# Rodistaa Design System Documentation

## Overview

The Rodistaa Design System provides a unified set of components, tokens, and guidelines for building consistent user interfaces across all Rodistaa applications (mobile apps and web portals).

## Design Tokens

### Colors
- **Primary**: #C90D0D (Rodistaa Red)
- **Secondary**: White with red border
- **Status Colors**: Success, Error, Warning, Info
- **Text Colors**: Primary, Secondary, Disabled, Hint, Inverse
- **Background**: Default, Paper, Dark, Overlay

### Typography
- **Headings**: Baloo Bhai
- **Body**: Times New Roman
- **Sizes**: Mobile and Web specific text styles

### Spacing
- Base scale: 2, 4, 8, 12, 16, 24, 32, 48
- Component spacing: Button, Input, Card padding
- Layout spacing: Page, Section, Card spacing
- Touch targets: Minimum 44px

### Border Radius
- Small: 4px
- Medium: 6px
- Large: 8px
- Extra Large: 12px

### Motion
- Micro transitions: 120ms ease
- Standard transitions: 200ms ease

## Component Architecture

### Atomic Components
Basic building blocks that cannot be broken down further:
- Buttons (RButton, RButtonWeb)
- Inputs (RInput)
- Cards (RCard, RCardWeb)
- Tags/Badges (RTag, RTagWeb)
- Modals (RModal, RModalWeb)
- And more...

### Molecule Components
Combinations of atomic components:
- LoadCard / LoadCardWeb
- TruckCard / TruckCardWeb
- BidCard / BidCardWeb
- Timeline / TimelineWeb

### Organism Components
Complex components combining molecules and atoms:
- BookingFlow (mobile)
- InspectionGrid (web)
- KYCViewer (web)
- ACSPanel (web)

## Usage

### Mobile (React Native)
```tsx
import { RButton, LoadCard, Timeline } from '@rodistaa/design-system';

<RButton title="Click Me" variant="primary" onPress={handlePress} />
<LoadCard {...loadData} onPress={handleCardPress} />
<Timeline events={timelineEvents} />
```

### Web (React/Next.js)
```tsx
import { RButtonWeb, LoadCardWeb, TimelineWeb } from '@rodistaa/design-system';

<RButtonWeb variant="primary" onClick={handleClick}>Click Me</RButtonWeb>
<LoadCardWeb {...loadData} onClick={handleCardClick} />
<TimelineWeb events={timelineEvents} />
```

## Storybook

View all components in Storybook:
```bash
cd packages/design-system
pnpm storybook
```

Stories available for:
- All atomic components
- All molecule components
- All organism components
- Multiple variants and states

## Testing

### Unit Tests
```bash
pnpm test
```

### Visual Regression Tests
```bash
pnpm test:visual
```

### Snapshot Tests
```bash
pnpm test:snapshot
```

## Accessibility

All components follow WCAG 2.1 AA standards:
- Minimum touch target: 44px
- Color contrast ratios meet requirements
- Keyboard navigation support
- Screen reader compatibility

## Brand Guidelines

- **Primary Color**: Always use #C90D0D for primary actions
- **Typography**: Baloo Bhai for headings, Times New Roman for body
- **Spacing**: Use token values, never hardcode
- **Motion**: 120ms for micro-interactions
- **Touch Targets**: Minimum 44px for mobile

## Contributing

When adding new components:
1. Use design tokens (never hardcode values)
2. Create Storybook stories
3. Add unit tests
4. Update this documentation
5. Ensure accessibility compliance

