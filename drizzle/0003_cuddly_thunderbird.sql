ALTER TABLE "user_offers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_offers" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_position_level_id_position_levels_id_fk";
--> statement-breakpoint
DROP INDEX "idx_users_position_level";--> statement-breakpoint
CREATE INDEX "idx_users_previous_position_level" ON "users" USING btree ("previous_position_id");--> statement-breakpoint
CREATE INDEX "idx_users_position_level" ON "users" USING btree ("current_position_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "position_level_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "position_start_date";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "position_end_date";