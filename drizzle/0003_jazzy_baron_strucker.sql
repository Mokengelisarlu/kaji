DROP TYPE "public"."contract_type";--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('CDI', 'CDD', 'STAGE', 'ALTERNANCE', 'FREELANCE', 'PRESTATION', 'CONSULTING');--> statement-breakpoint
DROP TYPE "public"."language_code";--> statement-breakpoint
CREATE TYPE "public"."language_code" AS ENUM('FR', 'EN', 'PT', 'ES', 'AR', 'SW', 'LN', 'KG', 'TS', 'RN', 'WO');