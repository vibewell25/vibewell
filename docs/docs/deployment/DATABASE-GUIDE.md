# VibeWell Database Guide

This guide provides information about the database setup for the VibeWell platform using Prisma and PostgreSQL.

## Overview

VibeWell uses:
- **PostgreSQL** as the primary database
- **Prisma ORM** for database access and migrations
- **Auth0** for authentication

## Database Setup

### Local Development

1. **Install PostgreSQL** locally or use Docker:

   ```bash
   # Using Docker
   docker run --name vibewell-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=vibewell_dev -p 5432:5432 -d postgres
   ```

2. **Configure Environment Variables**:

   Create a `.env.local` file with your database connection string:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vibewell_dev?schema=public"
   ```

3. **Run Migrations**:

   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma Client**:

   ```bash
   npx prisma generate
   ```

### Production Environment

For production, we use AWS RDS (PostgreSQL):

1. **Create an RDS Instance** in your AWS account
2. **Configure Security Groups** to allow access
3. **Set Environment Variables** in your deployment platform (e.g., Vercel)
4. **Run Migrations** during deployment

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Here are the main models:

- `User`: User accounts with roles and profiles
- `Account`: OAuth accounts linked to users
- `Session`: User sessions
- `Content`: Educational content
- `BeautyService`: Beauty services offered
- `ServiceBooking`: Service booking appointments
- `ServiceReview`: Reviews for services
- `PaymentIntent`: Payment processing records

## Working with Prisma

### Querying the Database

```typescript
import { prisma } from '@/lib/database/client';

// Find a single user
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// Find many records with relations
const bookings = await prisma.serviceBooking.findMany({
  where: { userId: userId },
  include: {
    service: true,
    provider: true
  }
});
```

### Creating Records

```typescript
// Create a new record
const newService = await prisma.beautyService.create({
  data: {
    name: 'Hair Styling',
    description: 'Professional hair styling service',
    price: 75.0,
    duration: 60
  }
});
```

### Updating Records

```typescript
// Update a record
const updatedBooking = await prisma.serviceBooking.update({
  where: { id: bookingId },
  data: { status: 'CONFIRMED' }
});
```

### Deleting Records

```typescript
// Delete a record
await prisma.serviceReview.delete({
  where: { id: reviewId }
});
```

## Database Tools

### Prisma Studio

Prisma Studio provides a visual interface to view and edit your database:

```bash
npx prisma studio
```

This will open a web interface at http://localhost:5555

### Database Migrations

To create and apply migrations:

```bash
# Create a new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations in production
npx prisma migrate deploy
```

### Seeding Data

You can seed the database with initial data:

```bash
npx prisma db seed
```

Seed scripts are defined in `prisma/seed.ts`.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check your connection string in `.env.local`
   - Ensure your database is running
   - Verify network access and security groups

2. **Migration Errors**:
   - Check for conflicts in migration files
   - Reset the database if needed: `npx prisma migrate reset`

3. **Schema Design Issues**:
   - Use `npx prisma format` to format your schema
   - Validate schema: `npx prisma validate`

## Best Practices

1. **Use Transactions** for operations that need to be atomic:
   ```typescript
   await prisma.$transaction(async (tx) => {
     // Operations here will be in a transaction
   });
   ```

2. **Optimize Queries** by only requesting needed data:
   ```typescript
   const users = await prisma.user.findMany({
     select: { id: true, name: true, email: true }
   });
   ```

3. **Add Indexes** for frequently queried fields:
   ```prisma
   model ServiceBooking {
     // Fields...
     
     @@index([userId])
     @@index([providerId])
   }
   ```

4. **Use Middleware** for common operations:
   ```typescript
   prisma.$use(async (params, next) => {
     // Add logging, transformation, etc.
     return next(params);
   });
   ```

## Further Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Auth0 Documentation](https://auth0.com/docs/) 