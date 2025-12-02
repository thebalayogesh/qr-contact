CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image" text,
	"provider" text,
	"provider_account_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_provider_account_id_unique" UNIQUE("provider_account_id")
);
