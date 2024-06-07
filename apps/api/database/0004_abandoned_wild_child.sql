ALTER TABLE "team_members" ALTER COLUMN "team_slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "team_users" ALTER COLUMN "team_slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "team_users" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;