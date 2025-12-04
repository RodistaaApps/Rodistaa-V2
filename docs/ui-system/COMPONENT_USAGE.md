# Component Usage Guide

## Mobile Components

### RButton
Primary button component for mobile apps.

```tsx
import { RButton } from '@rodistaa/design-system';

<RButton
  title="Submit"
  variant="primary"
  size="medium"
  onPress={() => {}}
  disabled={false}
  loading={false}
/>
```

**Props:**
- `title`: Button text
- `variant`: 'primary' | 'secondary' | 'text' | 'danger'
- `size`: 'small' | 'medium' | 'large'
- `onPress`: Press handler
- `disabled`: Disable button
- `loading`: Show loading state
- `fullWidth`: Full width button

### LoadCard
Display booking/load information.

```tsx
import { LoadCard } from '@rodistaa/design-system';

<LoadCard
  id="BKG-001"
  pickup={{ address: '123 Main St', city: 'Bangalore', state: 'KA' }}
  drop={{ address: '456 Park Ave', city: 'Chennai', state: 'TN' }}
  tonnage={15}
  priceRange={{ min: 20000, max: 30000 }}
  status="OPEN_FOR_BIDDING"
  bidCount={5}
  onPress={() => {}}
/>
```

### Timeline
Display shipment progress timeline.

```tsx
import { Timeline } from '@rodistaa/design-system';

<Timeline
  events={[
    {
      id: '1',
      title: 'Pickup Completed',
      description: 'Photos uploaded',
      timestamp: '2024-01-02T10:00:00Z',
      status: 'completed',
    },
    {
      id: '2',
      title: 'In Transit',
      timestamp: '2024-01-02T12:00:00Z',
      status: 'active',
    },
  ]}
/>
```

## Web Components

### RButtonWeb
Primary button component for web portals.

```tsx
import { RButtonWeb } from '@rodistaa/design-system';

<RButtonWeb
  variant="primary"
  size="medium"
  onClick={() => {}}
  disabled={false}
>
  Submit
</RButtonWeb>
```

### LoadCardWeb
Display booking/load information in portals.

```tsx
import { LoadCardWeb } from '@rodistaa/design-system';

<LoadCardWeb
  id="BKG-001"
  pickup={{ address: '123 Main St', city: 'Bangalore', state: 'KA' }}
  drop={{ address: '456 Park Ave', city: 'Chennai', state: 'TN' }}
  tonnage={15}
  priceRange={{ min: 20000, max: 30000 }}
  status="OPEN_FOR_BIDDING"
  bidCount={5}
  onClick={() => {}}
/>
```

### ACSPanel
Manage ACS override requests.

```tsx
import { ACSPanel } from '@rodistaa/design-system';

<ACSPanel
  overrides={overrideRequests}
  canApprove={true}
  onApprove={async (id, notes) => {}}
  onReject={async (id, reason) => {}}
/>
```

### InspectionGrid
Photo grid for truck inspections.

```tsx
import { InspectionGrid } from '@rodistaa/design-system';

<InspectionGrid
  photos={inspectionPhotos}
  canUpload={true}
  onUpload={(type, file) => {}}
  onPhotoClick={(photo) => {}}
/>
```

### KYCViewer
View encrypted KYC documents.

```tsx
import { KYCViewer } from '@rodistaa/design-system';

<KYCViewer
  documents={kycDocuments}
  canDecrypt={true}
  onDecrypt={async (id) => {}}
  onViewDocument={(id) => {}}
/>
```

## Best Practices

1. **Always use design tokens** - Never hardcode colors, spacing, or typography
2. **Use appropriate components** - Mobile components for React Native, Web components for React/Next.js
3. **Follow variant patterns** - Use 'primary' for main actions, 'secondary' for secondary actions
4. **Handle loading states** - Show loading indicators for async operations
5. **Accessibility first** - Ensure touch targets are ≥44px, proper contrast ratios

