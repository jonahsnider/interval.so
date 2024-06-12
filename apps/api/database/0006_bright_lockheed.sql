CREATE TABLE IF NOT EXISTS "finished_member_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
DROP TABLE "member_meetings";--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "pending_sign_in" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "finished_member_meetings" ADD CONSTRAINT "finished_member_meetings_member_id_team_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."team_members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finished_member_meetings_member_id_index" ON "finished_member_meetings" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finished_member_meetings_started_at_index" ON "finished_member_meetings" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finished_member_meetings_ended_at_index" ON "finished_member_meetings" USING btree ("ended_at");