-- Manually added
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "teams" ADD COLUMN "invite_code" text DEFAULT encode(gen_random_bytes(18), 'base64') NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_invite_code_unique" UNIQUE("invite_code");
