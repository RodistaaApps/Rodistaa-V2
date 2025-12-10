# Rodistaa Admin Portal

Next.js web portal for Admin users with Ant Design UI.

## Features
- ✅ Dashboard with metrics and KPIs
- ✅ KYC Management (view, decrypt, verify)
- ✅ Truck Management (list, block/unblock, inspections)
- ✅ Override Requests (approve/deny)
- 📋 Franchise Management (pattern established)
- 📋 Reports (pattern established)


## Tech Stack

- **Framework**: Next.js 14
- **UI Library**: Ant Design 5
- **State**: Zustand + React Query
- **API**: Axios with authentication
- **TypeScript**: Strict mode
- **Theme**: Rodistaa (#C90D0D, Times New Roman)

## Quick Start

```bash
# Install dependencies
cd packages/portal
pnpm install

# Start development server
pnpm dev
# Portal runs on http://localhost:3001

# Build for production
pnpm build
pnpm start
```

## Structure

```
packages/portal/
├── src/
│   ├── pages/
│   │   ├── _app.tsx           # App configuration
│   │   ├── login.tsx           # Login page
│   │   ├── admin/
│   │   │   ├── dashboard.tsx   # Admin dashboard
│   │   │   ├── kyc.tsx         # KYC management
│   │   │   ├── trucks.tsx      # Truck management
│   │   │   └── overrides.tsx   # Override requests
│   │   └── franchise/
│   │       └── dashboard.tsx   # Franchise dashboard
│   ├── components/
│   │   ├── ProtectedRoute.tsx  # RBAC enforcement
│   │   └── Layout/
│   │       └── AdminLayout.tsx # Admin layout
│   ├── api/
│   │   └── client.ts           # API client
│   ├── hooks/
│   │   └── useAuth.ts          # Authentication hook
│   ├── theme/
│   │   └── rodistaa.ts         # Ant Design theme
│   └── styles/
│       └── globals.css         # Global styles
├── tests/
│   └── admin.spec.ts           # Playwright tests
└── package.json
```

## Authentication

Uses JWT authentication with role-based access control:

**Roles**:
- `SUPER_ADMIN` - Full access
- `FRAUD_INVESTIGATOR` - KYC, fraud alerts
- `ACCOUNTS` - Financial operations
- `SUPPORT` - Customer support
- `FRANCHISE_DISTRICT` - District operations
- `FRANCHISE_UNIT` - Unit operations

## Development

### Login Credentials (Mock)
```
Email: admin@rodistaa.com
Password: admin123
```

### API Configuration
Default: `http://localhost:4000/v1`

Configure via environment variable:
```bash
NEXT_PUBLIC_API_URL=https://api.rodistaa.com/v1
```

## Testing

```bash
# Run Playwright tests
pnpm test:e2e
```

## Next Steps

Team can extend with additional modules following established patterns:

**Admin Portal**:
- Booking management
- Shipment tracking
- Advanced reports
- User management

**Franchise Portal**:
- Performance analytics
- Communication module
- Detailed reports

All patterns demonstrated in existing modules.

## Documentation

- `PORTALS_STATUS.md` - Implementation status
- `PORTAL_IMPLEMENTATION_COMPLETE.md` - Complete guide
- Ant Design: https://ant.design
- Next.js: https://nextjs.org
