CREATE TABLE IF NOT EXISTS "table_version" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"table_slug" text NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"definition" text NOT NULL,
	"description" text,
	"available_tables" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "table_version_owner_id_table_slug_version_pk" PRIMARY KEY("owner_id","table_slug","version"),
	CONSTRAINT "table_version_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "table" RENAME COLUMN "user_id" TO "owner_id";--> statement-breakpoint
ALTER TABLE "table" DROP CONSTRAINT "tables_user_id_slug_unique";--> statement-breakpoint
ALTER TABLE "table" DROP CONSTRAINT "table_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "tables_user_id_favorited_idx";--> statement-breakpoint

ALTER TABLE "table" DROP CONSTRAINT "table_pkey";--> statement-breakpoint
ALTER TABLE "table" ADD CONSTRAINT "table_owner_id_slug_pk" PRIMARY KEY("owner_id","slug");--> statement-breakpoint
ALTER TABLE "table" ADD COLUMN "available_tables" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "table_version" ADD CONSTRAINT "table_version_owner_id_table_slug_table_owner_id_slug_fk" FOREIGN KEY ("owner_id","table_slug") REFERENCES "public"."table"("owner_id","slug") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "table" ADD CONSTRAINT "table_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tables_owner_id_favorited_idx" ON "table" USING btree ("owner_id","favorited" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "table" ADD CONSTRAINT "table_id_unique" UNIQUE("id");
