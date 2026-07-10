-- Migration: properties backend compatibility (Supabase)
-- Date: 2026-07-09
-- Goal: Add all missing columns required by current backend property model
-- Scope: public.properties only

begin;

alter table public.properties
  add column if not exists "space" double precision,
  add column if not exists "isFeatured" boolean default false,
  add column if not exists "isSuspended" boolean default false,
  add column if not exists "featuredPackage" text,
  add column if not exists "country" text,
  add column if not exists "village" text,
  add column if not exists "postalCode" text,
  add column if not exists "googleMapsUrl" text,
  add column if not exists "locationTimestamp" text,
  add column if not exists "livingRooms" integer default 0,
  add column if not exists "floors" integer default 0,
  add column if not exists "isFurnished" boolean default false,
  add column if not exists "hasGarage" boolean default false,
  add column if not exists "hasGarden" boolean default false,
  add column if not exists "hasElevator" boolean default false,
  add column if not exists "hasGenerator" boolean default false,
  add column if not exists "hasSolarPower" boolean default false,
  add column if not exists "hasPool" boolean default false,
  add column if not exists "videoUrl" text,
  add column if not exists "views" integer default 0,
  add column if not exists "favoritesCount" integer default 0,
  add column if not exists "updatedAt" text,
  add column if not exists "daysOnPlatform" integer default 0,
  add column if not exists "isVerified" boolean default false,
  add column if not exists "phoneViews" integer default 0,
  add column if not exists "isAuction" boolean default false,
  add column if not exists "auctionStart" text,
  add column if not exists "auctionEnd" text,
  add column if not exists "startingPrice" double precision,
  add column if not exists "highestBid" double precision,
  add column if not exists "highestBidderId" text,
  add column if not exists "isAuctionActive" boolean default false;

-- Backfill existing rows for operational safety
update public.properties
set
  "views" = coalesce("views", 0),
  "favoritesCount" = coalesce("favoritesCount", 0),
  "phoneViews" = coalesce("phoneViews", 0),
  "daysOnPlatform" = coalesce("daysOnPlatform", 0),
  "livingRooms" = coalesce("livingRooms", 0),
  "floors" = coalesce("floors", 0),
  "isFeatured" = coalesce("isFeatured", false),
  "isSuspended" = coalesce("isSuspended", false),
  "isFurnished" = coalesce("isFurnished", false),
  "hasGarage" = coalesce("hasGarage", false),
  "hasGarden" = coalesce("hasGarden", false),
  "hasElevator" = coalesce("hasElevator", false),
  "hasGenerator" = coalesce("hasGenerator", false),
  "hasSolarPower" = coalesce("hasSolarPower", false),
  "hasPool" = coalesce("hasPool", false),
  "isVerified" = coalesce("isVerified", false),
  "isAuction" = coalesce("isAuction", false),
  "isAuctionActive" = coalesce("isAuctionActive", false),
  "updatedAt" = coalesce("updatedAt", "createdAt", now()::text)
where true;

-- Helpful indexes for admin moderation / listing paths
create index if not exists idx_properties_isApproved_status on public.properties ("isApproved", "status");
create index if not exists idx_properties_updatedAt on public.properties ("updatedAt");

commit;
