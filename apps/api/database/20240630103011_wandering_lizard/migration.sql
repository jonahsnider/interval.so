-- Manually added
CREATE EXTENSION IF NOT EXISTS citext;
--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "slug" SET DATA TYPE citext;
