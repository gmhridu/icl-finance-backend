ALTER TABLE "users" ADD COLUMN "position_start_date" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "position_end_date" timestamp;