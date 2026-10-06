CREATE TYPE "public"."availability_type" AS ENUM('IMMEDIATELY', 'ONE_MONTH', 'THREE_MONTHS', 'OPEN_TO_OPPORTUNITIES', 'NOT_AVAILABLE');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('CDI', 'CDD', 'STAGE', 'ALTERNANCE', 'INTERIM', 'FREELANCE', 'CONSULTING');--> statement-breakpoint
CREATE TYPE "public"."language_code" AS ENUM('fr', 'en', 'pt', 'es', 'ar', 'sw', 'ln', 'kg', 'ts', 'rn', 'wo');--> statement-breakpoint
CREATE TYPE "public"."language_level" AS ENUM('NATIVE', 'PROFESSIONAL', 'INTERMEDIATE', 'BASIC');--> statement-breakpoint
CREATE TYPE "public"."pool_kind" AS ENUM('TALENT_POOL', 'PRESTATAIRE_POOL');--> statement-breakpoint
CREATE TYPE "public"."profile_visibility" AS ENUM('PUBLIC', 'ON_REQUEST', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."talent_source" AS ENUM('WEBSITE', 'WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'SCHOOL', 'UNIVERSITY', 'TRAINING_CENTER', 'REFERRAL', 'FIELD_OUTREACH', 'RECRUITMENT_CAMPAIGN', 'DIRECT_SIGNUP');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('UNVERIFIED', 'IN_REVIEW', 'PARTIAL', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "candidate_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" varchar(20) NOT NULL,
	"clerk_user_id" varchar(255),
	"full_name" varchar(255) NOT NULL,
	"headline" varchar(255) NOT NULL,
	"category_slug" varchar(100) NOT NULL,
	"category_label" varchar(150) NOT NULL,
	"domain_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"city_slug" varchar(100) NOT NULL,
	"city" varchar(150) NOT NULL,
	"country" varchar(150) NOT NULL,
	"is_remote_eligible" boolean DEFAULT true NOT NULL,
	"years_of_experience" integer NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"availability" varchar(50) NOT NULL,
	"declared_availability" "availability_type",
	"desired_contract_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"summary" text NOT NULL,
	"pool_kind" "pool_kind" DEFAULT 'TALENT_POOL' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"source" "talent_source" DEFAULT 'DIRECT_SIGNUP' NOT NULL,
	"experiences" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"education" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"certifications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"profile_visibility" "profile_visibility" DEFAULT 'PUBLIC' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidate_profiles_candidate_id_unique" UNIQUE("candidate_id"),
	CONSTRAINT "candidate_profiles_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
