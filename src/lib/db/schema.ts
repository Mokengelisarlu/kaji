import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const profileVisibilityEnum = pgEnum("profile_visibility", ["PUBLIC", "ON_REQUEST", "PRIVATE"]);
export const poolKindEnum = pgEnum("pool_kind", ["TALENT_POOL", "PRESTATAIRE_POOL"]);
export const talentSourceEnum = pgEnum("talent_source", [
  "WEBSITE", "WHATSAPP", "FACEBOOK", "INSTAGRAM", "LINKEDIN", "SCHOOL", "UNIVERSITY",
  "TRAINING_CENTER", "REFERRAL", "FIELD_OUTREACH", "RECRUITMENT_CAMPAIGN", "DIRECT_SIGNUP"
]);
export const availabilityTypeEnum = pgEnum("availability_type", [
  "IMMEDIATELY", "ONE_MONTH", "THREE_MONTHS", "OPEN_TO_OPPORTUNITIES", "NOT_AVAILABLE"
]);
export const contractTypeEnum = pgEnum("contract_type", [
  "CDI", "CDD", "STAGE", "ALTERNANCE", "INTERIM", "FREELANCE", "CONSULTING"
]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "UNVERIFIED", "IN_REVIEW", "PARTIAL", "VERIFIED", "REJECTED"
]);
export const languageCodeEnum = pgEnum("language_code", [
  "fr", "en", "pt", "es", "ar", "sw", "ln", "kg", "ts", "rn", "wo"
]);
export const languageLevelEnum = pgEnum("language_level", [
  "NATIVE", "PROFESSIONAL", "INTERMEDIATE", "BASIC"
]);

export const candidateProfiles = pgTable("candidate_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  candidateId: varchar("candidate_id", { length: 20 }).notNull().unique(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  headline: varchar("headline", { length: 255 }).notNull(),
  categorySlug: varchar("category_slug", { length: 100 }).notNull(),
  categoryLabel: varchar("category_label", { length: 150 }).notNull(),
  domainSlugs: jsonb("domain_slugs").$type<string[]>().notNull().default([]),
  citySlug: varchar("city_slug", { length: 100 }).notNull(),
  city: varchar("city", { length: 150 }).notNull(),
  country: varchar("country", { length: 150 }).notNull(),
  isRemoteEligible: boolean("is_remote_eligible").notNull().default(true),
  yearsOfExperience: integer("years_of_experience").notNull(),
  skills: jsonb("skills").$type<Array<{id: string; label: string; level: number; yearsOfPractice?: number}>>().notNull().default([]),
  languages: jsonb("languages").$type<Array<{code: string; level: string}>>().notNull().default([]),
  availability: varchar("availability", { length: 50 }).notNull(),
  declaredAvailability: availabilityTypeEnum("declared_availability"),
  desiredContractTypes: jsonb("desired_contract_types").$type<string[]>().notNull().default([]),
  summary: text("summary").notNull(),
  poolKind: poolKindEnum("pool_kind").notNull().default("TALENT_POOL"),
  isVerified: boolean("is_verified").notNull().default(false),
  source: talentSourceEnum("source").notNull().default("DIRECT_SIGNUP"),
  experiences: jsonb("experiences").$type<Array<any>>().notNull().default([]),
  education: jsonb("education").$type<Array<any>>().notNull().default([]),
  certifications: jsonb("certifications").$type<Array<any>>().notNull().default([]),
  profileVisibility: profileVisibilityEnum("profile_visibility").notNull().default("PUBLIC"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
