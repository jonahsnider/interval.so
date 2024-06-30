-- Manually added
CREATE EXTENSION IF NOT EXISTS citext;

ALTER TABLE "teams" ALTER COLUMN "slug" SET DATA TYPE citext;
