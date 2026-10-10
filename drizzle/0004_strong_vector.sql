CREATE TYPE "public"."company_size" AS ENUM('MICRO', 'SMALL', 'MEDIUM', 'LARGE');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_clerk_user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"legal_name" varchar(255),
	"sector" varchar(150) NOT NULL,
	"size" "company_size" NOT NULL,
	"city" varchar(150) NOT NULL,
	"country" varchar(150) NOT NULL,
	"website" varchar(255),
	"contact_name" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(50),
	"description" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_owner_clerk_user_id_unique" UNIQUE("owner_clerk_user_id")
);
