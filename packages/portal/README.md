# Rodistaa Portals

Next.js portals for Admin and Franchise operations.

## Structure

```
portal/
├── src/
│   ├── pages/
│   │   ├── admin/        # Admin portal pages
│   │   └── franchise/    # Franchise portal pages
│   └── components/       # Shared components
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Features

### Admin Portal
- Dashboard with key metrics
- Booking management
- Shipment monitoring
- Compliance oversight
- Franchise management

### Franchise Portal
- Inspection dashboard
- Truck compliance tracking
- Performance metrics
- Operator management

## Configuration

Set environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/v1
```

