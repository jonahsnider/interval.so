ALTER TABLE "finished_member_meetings" RENAME TO "member_attendance";--> statement-breakpoint
ALTER TABLE "member_attendance" DROP CONSTRAINT "finished_member_meetings_member_id_team_members_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "finished_member_meetings_member_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "finished_member_meetings_started_at_index";--> statement-breakpoint
DROP INDEX IF EXISTS "finished_member_meetings_ended_at_index";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_attendance" ADD CONSTRAINT "member_attendance_member_id_team_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."team_members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_attendance_member_id_index" ON "member_attendance" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_attendance_started_at_index" ON "member_attendance" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_attendance_ended_at_index" ON "member_attendance" USING btree ("ended_at");