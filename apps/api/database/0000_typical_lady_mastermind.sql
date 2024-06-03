DO $$ BEGIN
 CREATE TYPE "public"."team_user_role" AS ENUM('owner', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member_meetings" (
	"member_id" uuid,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	CONSTRAINT "member_meetings_member_id_started_at_pk" PRIMARY KEY("member_id","started_at")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_slug" text,
	"name" text NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "team_members_team_slug_name_unique" UNIQUE("team_slug","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_users" (
	"team_slug" text,
	"user_id" uuid,
	"role" "team_user_role" DEFAULT 'admin' NOT NULL,
	CONSTRAINT "team_users_team_slug_user_id_pk" PRIMARY KEY("team_slug","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"slug" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"password" text NOT NULL,
	"display_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_meetings" ADD CONSTRAINT "member_meetings_member_id_team_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."team_members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_slug_teams_slug_fk" FOREIGN KEY ("team_slug") REFERENCES "public"."teams"("slug") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_users" ADD CONSTRAINT "team_users_team_slug_teams_slug_fk" FOREIGN KEY ("team_slug") REFERENCES "public"."teams"("slug") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_users" ADD CONSTRAINT "team_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_meetings_started_at_index" ON "member_meetings" USING btree (started_at);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_meetings_ended_at_index" ON "member_meetings" USING btree (ended_at);