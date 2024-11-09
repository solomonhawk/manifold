ALTER TABLE "table" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "table" ADD COLUMN "description" text;--> statement-breakpoint

ALTER TABLE "table" ADD CONSTRAINT "tables_user_id_slug_unique" UNIQUE("user_id","slug");
