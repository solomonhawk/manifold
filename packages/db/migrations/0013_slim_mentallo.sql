ALTER TABLE "table_version" DROP CONSTRAINT "table_version_owner_id_table_slug_table_owner_id_slug_fk";
--> statement-breakpoint
ALTER TABLE "table_version" DROP CONSTRAINT "table_version_owner_id_table_slug_version_pk";--> statement-breakpoint
ALTER TABLE "table" DROP CONSTRAINT "table_owner_id_slug_pk";--> statement-breakpoint

ALTER TABLE "table_version" ADD COLUMN "table_identifier" text NOT NULL;--> statement-breakpoint
ALTER TABLE "table_version" ADD COLUMN "owner_username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "table_version" ADD COLUMN "release_notes" text;--> statement-breakpoint
ALTER TABLE "table" ADD COLUMN "table_identifier" text NOT NULL;--> statement-breakpoint
ALTER TABLE "table" ADD COLUMN "owner_username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "table" ADD CONSTRAINT "table_owner_username_slug_pk" PRIMARY KEY("owner_username","slug");--> statement-breakpoint
ALTER TABLE "table_version" ADD CONSTRAINT "table_version_owner_id_owner_username_table_slug_version_pk" PRIMARY KEY("owner_id","owner_username","table_slug","version");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "table_version" ADD CONSTRAINT "table_version_owner_username_table_slug_table_owner_username_slug_fk" FOREIGN KEY ("owner_username","table_slug") REFERENCES "public"."table"("owner_username","slug") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "table" ADD CONSTRAINT "table_owner_username_user_profile_username_fk" FOREIGN KEY ("owner_username") REFERENCES "public"."user_profile"("username") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tables_table_indentifier_idx" ON "table" USING btree ("table_identifier");--> statement-breakpoint
ALTER TABLE "table_version" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "table_version" ADD CONSTRAINT "table_versions_table_identifier_version_unique" UNIQUE("table_identifier","version");--> statement-breakpoint
ALTER TABLE "table" ADD CONSTRAINT "table_table_identifier_unique" UNIQUE("table_identifier");
