CREATE TYPE "public"."admin_role_enum" AS ENUM('ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SYSTEM_CHANGE');--> statement-breakpoint
CREATE TYPE "public"."bank_type" AS ENUM('JAZZCASH', 'EASYPaisa', 'USDT_TRC20');--> statement-breakpoint
CREATE TYPE "public"."referral_level" AS ENUM('A_LEVEL', 'B_LEVEL', 'C_LEVEL');--> statement-breakpoint
CREATE TYPE "public"."security_refund_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."log_level" AS ENUM('debug', 'info', 'warn', 'error', 'fatal');--> statement-breakpoint
CREATE TYPE "public"."notification_severity" AS ENUM('info', 'warning', 'error', 'success');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('system_alert', 'user_action', 'withdrawal_request', 'video_upload', 'user_registration', 'maintenance', 'security_alert', 'task_completed');--> statement-breakpoint
CREATE TYPE "public"."topup_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'banned');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('credit', 'debit', 'position_deposit', 'referral_reward_a', 'referral_reward_b', 'referral_reward_c', 'management_bonus_a', 'management_bonus_b', 'management_bonus_c', 'task_income', 'topup_bonus', 'special_commission', 'security_refund');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_request_status" AS ENUM('pending', 'approved', 'rejected', 'processed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity" varchar(255),
	"description" text,
	"metadata" jsonb,
	"ip_address" varchar(100),
	"session_id" varchar(255),
	"user_agent" text,
	"admin_id" uuid,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" "admin_role_enum" DEFAULT 'ADMIN' NOT NULL,
	"phone" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "admin_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_type" "bank_type" NOT NULL,
	"wallet_number" varchar(100),
	"wallet_holder_name" varchar(255),
	"usdt_wallet_address" varchar(255),
	"qr_code_url" varchar(512),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"message" text,
	"image_url" varchar(1024),
	"target_type" varchar(50) DEFAULT 'all' NOT NULL,
	"target_id" varchar(255),
	"schedule_type" varchar(50),
	"scheduled_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"announcement_id" uuid NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_announcements" UNIQUE("user_id","announcement_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" "audit_action" NOT NULL,
	"description" text NOT NULL,
	"details" jsonb,
	"admin_id" uuid,
	"target_id" uuid,
	"target_type" varchar(100),
	"ip_address" varchar(100),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_holder_name" varchar(255) NOT NULL,
	"bank_name" "bank_type" NOT NULL,
	"account_number" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cache_key" varchar(255) NOT NULL,
	"data" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dashboard_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_resets_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"duration_days" integer NOT NULL,
	"daily_video_limit" integer NOT NULL,
	"reward_per_video" integer NOT NULL,
	"referral_bonus" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "position_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(250) NOT NULL,
	"level" integer NOT NULL,
	"deposit" integer NOT NULL,
	"tasks_per_day" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "position_levels_name_unique" UNIQUE("name"),
	CONSTRAINT "position_levels_level_unique" UNIQUE("level")
);
--> statement-breakpoint
CREATE TABLE "referral_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referred_user_id" uuid,
	"referral_code" varchar(64),
	"ip_address" varchar(100),
	"user_agent" text,
	"source" varchar(100),
	"reward_amount" integer DEFAULT 0,
	"reward_paid_at" timestamp,
	"qualified_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_hierarchy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" "referral_level" NOT NULL,
	"referrer_activity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_referral_hierarchy_referrer_user" UNIQUE("referrer_activity_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "security_refund_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"from_level" integer NOT NULL,
	"to_level" integer NOT NULL,
	"refund_amount" integer NOT NULL,
	"status" "security_refund_status" DEFAULT 'pending' NOT NULL,
	"request_note" text,
	"admin_notes" text,
	"processed_by" uuid,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"category" varchar(100),
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "slider_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" varchar(1024) NOT NULL,
	"alt_text" varchar(255),
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" "log_level" NOT NULL,
	"component" varchar(255),
	"message" text NOT NULL,
	"error" text,
	"metadata" jsonb,
	"description" text,
	"admin_id" uuid,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(500) NOT NULL,
	"message" text,
	"severity" "notification_severity" DEFAULT 'info' NOT NULL,
	"metadata" jsonb,
	"action_url" varchar(1024),
	"target_id" varchar(255),
	"target_type" varchar(100),
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_management_bonuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subordinate_id" uuid NOT NULL,
	"subordinate_level" "referral_level" NOT NULL,
	"bonus_amount" integer NOT NULL,
	"task_date" timestamp NOT NULL,
	"task_income" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topup_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"selected_wallet_id" uuid,
	"payment_proof" varchar(1024),
	"status" "topup_request_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"processed_by" uuid,
	"processed_at" timestamp,
	"transaction_id" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "topup_requests_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "user_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"announcement_id" uuid,
	"offer_type" varchar(100),
	"offer_value" varchar(255),
	"offer_code" varchar(100),
	"description" text,
	"is_redeemed" boolean DEFAULT false NOT NULL,
	"redeemed_at" timestamp,
	"expires_at" timestamp,
	"scheduled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"amount_paid" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "plan_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"real_name" varchar(255),
	"avatar_url" varchar(512),
	"bio" text,
	"date_of_birth" date,
	"country" varchar(100),
	"city" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255),
	"name" varchar(150),
	"phone" varchar(20) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"referral_code" varchar(64),
	"referred_by" uuid,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"ip_address" varchar(100),
	"device_id" varchar(255),
	"wallet_balance" integer DEFAULT 0 NOT NULL,
	"total_earnings" integer DEFAULT 0 NOT NULL,
	"commission_balance" integer DEFAULT 0 NOT NULL,
	"security_refund" integer DEFAULT 0 NOT NULL,
	"deposit_paid" integer DEFAULT 0 NOT NULL,
	"position_level_id" uuid,
	"current_position_id" uuid,
	"previous_position_id" uuid,
	"position_start_date" timestamp,
	"position_end_date" timestamp,
	"is_intern" boolean DEFAULT true NOT NULL,
	"fund_password" varchar(255),
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"last_failed_login" timestamp,
	"locked_until" timestamp,
	"last_login_at" timestamp,
	"referred_by_activity_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"sign_up_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "video_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"watched_at" timestamp DEFAULT now() NOT NULL,
	"watch_duration" integer,
	"reward_earned" integer,
	"position_level" varchar(100),
	"ip_address" varchar(100),
	"device_id" varchar(255),
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_video_tasks_user_video" UNIQUE("user_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"url" varchar(1024) NOT NULL,
	"thumbnail_url" varchar(1024),
	"duration" integer NOT NULL,
	"reward_amount" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"available_from" timestamp,
	"available_to" timestamp,
	"position_level_id" uuid,
	"cloudinary_public_id" varchar(255),
	"tags" text,
	"upload_method" varchar(50) DEFAULT 'file' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"description" text,
	"reference_id" varchar(128),
	"status" "transaction_status" DEFAULT 'completed' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_transactions_reference_id_unique" UNIQUE("reference_id")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phone" varchar(30) NOT NULL,
	"otp" varchar(16) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "withdrawal_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"bank_card_id" uuid,
	"payment_method" varchar(100),
	"status" "withdrawal_request_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"processed_by" uuid,
	"processed_at" timestamp,
	"transaction_id" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_announcements" ADD CONSTRAINT "user_announcements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_announcements" ADD CONSTRAINT "user_announcements_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_cards" ADD CONSTRAINT "bank_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_activities" ADD CONSTRAINT "referral_activities_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_activities" ADD CONSTRAINT "referral_activities_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_hierarchy" ADD CONSTRAINT "referral_hierarchy_referrer_activity_id_referral_activities_id_fk" FOREIGN KEY ("referrer_activity_id") REFERENCES "public"."referral_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_hierarchy" ADD CONSTRAINT "referral_hierarchy_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_refund_requests" ADD CONSTRAINT "security_refund_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_refund_requests" ADD CONSTRAINT "security_refund_requests_processed_by_admin_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_management_bonuses" ADD CONSTRAINT "task_management_bonuses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_management_bonuses" ADD CONSTRAINT "task_management_bonuses_subordinate_id_users_id_fk" FOREIGN KEY ("subordinate_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topup_requests" ADD CONSTRAINT "topup_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topup_requests" ADD CONSTRAINT "topup_requests_selected_wallet_id_admin_wallets_id_fk" FOREIGN KEY ("selected_wallet_id") REFERENCES "public"."admin_wallets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topup_requests" ADD CONSTRAINT "topup_requests_processed_by_admin_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_offers" ADD CONSTRAINT "user_offers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_offers" ADD CONSTRAINT "user_offers_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_position_level_id_position_levels_id_fk" FOREIGN KEY ("position_level_id") REFERENCES "public"."position_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_current_position_id_position_levels_id_fk" FOREIGN KEY ("current_position_id") REFERENCES "public"."position_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_previous_position_id_position_levels_id_fk" FOREIGN KEY ("previous_position_id") REFERENCES "public"."position_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_activity_id_referral_activities_id_fk" FOREIGN KEY ("referred_by_activity_id") REFERENCES "public"."referral_activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_tasks" ADD CONSTRAINT "video_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_tasks" ADD CONSTRAINT "video_tasks_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_position_level_id_position_levels_id_fk" FOREIGN KEY ("position_level_id") REFERENCES "public"."position_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_otps" ADD CONSTRAINT "whatsapp_otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_bank_card_id_bank_cards_id_fk" FOREIGN KEY ("bank_card_id") REFERENCES "public"."bank_cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_processed_by_admin_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activity_logs_user_id" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_admin_id" ON "activity_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_created_at" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_activity" ON "activity_logs" USING btree ("activity");--> statement-breakpoint
CREATE INDEX "idx_admin_users_email" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_admin_users_role" ON "admin_users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_admin_wallets_type" ON "admin_wallets" USING btree ("wallet_type");--> statement-breakpoint
CREATE INDEX "idx_admin_wallets_active" ON "admin_wallets" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_announcements_active" ON "announcements" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_announcements_scheduled_at" ON "announcements" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_announcements_target" ON "announcements" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "idx_user_announcements_user_id" ON "user_announcements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_announcements_announcement_id" ON "user_announcements" USING btree ("announcement_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_admin_id" ON "audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_target" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_bank_cards_user_id" ON "bank_cards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_bank_cards_active" ON "bank_cards" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_dashboard_cache_key" ON "dashboard_cache" USING btree ("cache_key");--> statement-breakpoint
CREATE INDEX "idx_dashboard_cache_expires_at" ON "dashboard_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_password_resets_user_id" ON "password_resets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_resets_token" ON "password_resets" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_password_resets_expires_at" ON "password_resets" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_plans_active" ON "plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_position_levels_level" ON "position_levels" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_position_levels_active" ON "position_levels" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_referral_activities_referrer" ON "referral_activities" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_activities_referred" ON "referral_activities" USING btree ("referred_user_id");--> statement-breakpoint
CREATE INDEX "idx_referral_activities_code" ON "referral_activities" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "idx_referral_hierarchy_user" ON "referral_hierarchy" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_referral_hierarchy_activity" ON "referral_hierarchy" USING btree ("referrer_activity_id");--> statement-breakpoint
CREATE INDEX "idx_security_refund_user_id" ON "security_refund_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_security_refund_status" ON "security_refund_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_settings_key" ON "settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_settings_category" ON "settings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_slider_images_active" ON "slider_images" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_slider_images_order" ON "slider_images" USING btree ("order");--> statement-breakpoint
CREATE INDEX "idx_system_logs_level" ON "system_logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_system_logs_component" ON "system_logs" USING btree ("component");--> statement-breakpoint
CREATE INDEX "idx_system_logs_user_id" ON "system_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_system_logs_created_at" ON "system_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_system_notifications_type" ON "system_notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_system_notifications_is_read" ON "system_notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "idx_system_notifications_created_at" ON "system_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_task_bonuses_user_id" ON "task_management_bonuses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_task_bonuses_subordinate_id" ON "task_management_bonuses" USING btree ("subordinate_id");--> statement-breakpoint
CREATE INDEX "idx_task_bonuses_task_date" ON "task_management_bonuses" USING btree ("task_date");--> statement-breakpoint
CREATE INDEX "idx_topup_requests_user_id" ON "topup_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_topup_requests_status" ON "topup_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_topup_requests_processed_at" ON "topup_requests" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "idx_user_offers_user_id" ON "user_offers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_offers_expires_at" ON "user_offers" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_user_offers_redeemed" ON "user_offers" USING btree ("is_redeemed");--> statement-breakpoint
CREATE INDEX "idx_user_plans_user_id" ON "user_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_plans_plan_id" ON "user_plans" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_user_plans_status" ON "user_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_user_id" ON "user_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_referral_code" ON "users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "idx_users_referred_by" ON "users" USING btree ("referred_by");--> statement-breakpoint
CREATE INDEX "idx_users_position_level" ON "users" USING btree ("position_level_id");--> statement-breakpoint
CREATE INDEX "idx_video_tasks_user_id" ON "video_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_video_tasks_video_id" ON "video_tasks" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "idx_video_tasks_watched_at" ON "video_tasks" USING btree ("watched_at");--> statement-breakpoint
CREATE INDEX "idx_videos_active" ON "videos" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_videos_position_level" ON "videos" USING btree ("position_level_id");--> statement-breakpoint
CREATE INDEX "idx_videos_available_from" ON "videos" USING btree ("available_from");--> statement-breakpoint
CREATE INDEX "idx_wallet_tx_user_id" ON "wallet_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_wallet_tx_type" ON "wallet_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_wallet_tx_reference" ON "wallet_transactions" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "idx_wallet_tx_status" ON "wallet_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_wallet_tx_created_at" ON "wallet_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_whatsapp_otps_phone" ON "whatsapp_otps" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_whatsapp_otps_user_id" ON "whatsapp_otps" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_whatsapp_otps_expires_at" ON "whatsapp_otps" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_user_id" ON "withdrawal_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_status" ON "withdrawal_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_processed_at" ON "withdrawal_requests" USING btree ("processed_at");