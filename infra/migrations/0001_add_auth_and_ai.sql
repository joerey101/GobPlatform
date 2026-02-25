-- Migration: 0001_add_auth_and_ai
-- Created manually to include citizen_auth and AI-related tables

CREATE TYPE "public"."ai_run_status" AS ENUM('succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."ai_suggestion_type" AS ENUM('classification', 'priority', 'draft_reply');--> statement-breakpoint
CREATE TYPE "public"."ai_suggestion_status" AS ENUM('proposed', 'accepted', 'rejected', 'edited');--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "citizen_auth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"citizen_id" uuid NOT NULL,
	"cuil" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "citizen_auth_citizen_id_unique" UNIQUE("citizen_id"),
	CONSTRAINT "citizen_auth_cuil_unique" UNIQUE("cuil")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_model_provider_name_version_unique" UNIQUE("provider","name","version")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purpose" text DEFAULT 'classify+suggest' NOT NULL,
	"request_id" uuid,
	"citizen_id" uuid,
	"service_id" uuid,
	"model_id" uuid NOT NULL,
	"status" "ai_run_status" DEFAULT 'succeeded' NOT NULL,
	"input_hash" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_suggestion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"suggestion_type" "ai_suggestion_type" NOT NULL,
	"payload_json" text NOT NULL,
	"confidence" double precision,
	"status" "ai_suggestion_status" DEFAULT 'proposed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "citizen_auth" ADD CONSTRAINT "citizen_auth_citizen_id_citizen_id_fk" FOREIGN KEY ("citizen_id") REFERENCES "public"."citizen"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_run" ADD CONSTRAINT "ai_run_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_run" ADD CONSTRAINT "ai_run_citizen_id_citizen_id_fk" FOREIGN KEY ("citizen_id") REFERENCES "public"."citizen"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_run" ADD CONSTRAINT "ai_run_service_id_service_catalog_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service_catalog"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_run" ADD CONSTRAINT "ai_run_model_id_ai_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_model"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_suggestion" ADD CONSTRAINT "ai_suggestion_run_id_ai_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."ai_run"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
