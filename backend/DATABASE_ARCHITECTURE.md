# Backend Database Architecture

## Overview

The Rodistaa backend uses a **hybrid database approach** with both TypeORM and Prisma ORMs coexisting.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Database                     │
│  (Single database, multiple connection pools)       │
└─────────────────────────────────────────────────────┘
              │                    │
              │                    │
    ┌─────────▼─────────┐  ┌──────▼─────────┐
    │   TypeORM         │  │    Prisma      │
    │   Connection      │  │   Connection   │
    │   Pool            │  │    Pool        │
    └─────────┬─────────┘  └──────┬─────────┘
              │                    │
    ┌─────────▼─────────┐  ┌──────▼─────────┐
    │  Legacy Modules   │  │  New Services  │
    │  - Auth           │  │  - Ledger      │
    │  - Users          │  │  - Scheduling  │
    │  - Bookings       │  │  - Inspections │
    │  - Bids           │  │  - GPS Alerts  │
    │  - Shipments      │  │  - Distance    │
    │  - ...            │  │  - ...         │
    └───────────────────┘  └────────────────┘
```

## Database Configuration

### TypeORM Configuration
- **Location**: `backend/src/config/database.config.ts`
- **Module**: Configured in `AppModule`
- **Connection**: Uses `DATABASE_URL` or individual DB_* variables

### Prisma Configuration
- **Location**: `services/prisma/schema.prisma`
- **Service**: `PrismaService` in `CommonModule`
- **Connection**: Uses `DATABASE_URL` from ConfigService

## Connection Details

Both ORMs connect to the **same PostgreSQL database** but maintain separate connection pools:

```env
DATABASE_URL=postgresql://user:pass@host:5432/rodistaa_db?schema=public
```

### Connection Pooling

**TypeORM:**
- Pool size: 5-20 connections (configurable)
- Managed by TypeORM

**Prisma:**
- Pool size: Managed automatically
- Optimized by Prisma Client

## Module Usage Guidelines

### Use TypeORM For:
- ✅ Existing modules (maintained)
- ✅ Legacy codebase

### Use Prisma For:
- ✅ All new modules
- ✅ All new business logic services
- ✅ New features

See `docs/DATABASE_STRATEGY.md` for complete strategy.

## Best Practices

1. **New Development**: Always use Prisma
2. **Existing Code**: Keep TypeORM (until migrated)
3. **Migrations**: Use appropriate tool (TypeORM migrations or Prisma migrations)
4. **Transactions**: Use appropriate ORM's transaction support

## Migration Path

See `docs/DATABASE_STRATEGY.md` for migration plan.

