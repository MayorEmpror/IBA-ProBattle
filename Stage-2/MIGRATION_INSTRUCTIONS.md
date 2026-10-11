# Database Migration Required

## Issue
The database schema needs to be updated to support the new fields added in Stage 2:
- `coordinates.latitude` and `coordinates.longitude` in ServiceListings
- The `hasMany` select field for `availability.days` requires a join table

## Solution

Run the following command to create and apply migrations:

```bash
npm run payload migrate
```

Or if you need to create migrations first:

```bash
npm run payload migrate:create
npm run payload migrate
```

## What This Does

1. Creates migration files for the new fields
2. Updates the database schema to include:
   - `coordinates_latitude` and `coordinates_longitude` columns
   - `service_listings_availability_days` join table for the `hasMany` select field
3. Applies the migrations to your database

## After Migration

Once migrations are complete, the error should be resolved and you'll be able to:
- Create service listings with coordinates
- Query services with geospatial filtering
- Use the availability days field properly

## Note

If you're using a production database, make sure to:
1. Backup your database first
2. Test migrations on a staging environment
3. Run migrations during a maintenance window if needed
