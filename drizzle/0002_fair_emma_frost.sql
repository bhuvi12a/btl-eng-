CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'half_day', 'leave', 'overtime');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('raw_materials', 'cnc_tooling_inserts', 'machine_maintenance', 'electricity_power', 'coolant_lubricants', 'factory_rent', 'salary_wages', 'freight_transport', 'packaging', 'administrative', 'other');--> statement-breakpoint
CREATE TYPE "public"."expense_status" AS ENUM('pending_approval', 'approved', 'rejected', 'paid');--> statement-breakpoint
CREATE TYPE "public"."work_shift" AS ENUM('general', 'shift_1', 'shift_2', 'night');--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"employee_name" text NOT NULL,
	"employee_code" text NOT NULL,
	"date" date NOT NULL,
	"status" "attendance_status" DEFAULT 'present' NOT NULL,
	"shift" "work_shift" DEFAULT 'general' NOT NULL,
	"check_in_time" text,
	"check_out_time" text,
	"hours_worked" numeric(5, 2) DEFAULT '8.00',
	"overtime_hours" numeric(5, 2) DEFAULT '0.00',
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"gps_verified" boolean DEFAULT false NOT NULL,
	"correction_reason" text,
	"corrected_by_id" uuid,
	"is_archived" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bill_of_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_product_id" uuid NOT NULL,
	"raw_material_product_id" uuid NOT NULL,
	"quantity_required" numeric(12, 4) NOT NULL,
	"scrap_allowance_percent" numeric(5, 2) DEFAULT '5.00' NOT NULL,
	"machining_time_minutes" numeric(6, 2) DEFAULT '10.00' NOT NULL,
	"tooling_cost_per_unit" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"category" "expense_category" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0.00',
	"status" "expense_status" DEFAULT 'approved' NOT NULL,
	"expense_date" date NOT NULL,
	"payment_mode" text DEFAULT 'Bank Transfer',
	"vendor_name" text,
	"invoice_number" text,
	"receipt_url" text,
	"recorded_by_id" uuid,
	"approved_by_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" uuid,
	"product_id" uuid NOT NULL,
	"batch_number" text,
	"inspected_quantity" numeric(12, 2) NOT NULL,
	"passed_quantity" numeric(12, 2) NOT NULL,
	"rejected_quantity" numeric(12, 2) NOT NULL,
	"rejection_reason" text,
	"rejection_percentage" numeric(5, 2) DEFAULT '0.00',
	"inspected_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tally_offline_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"integration_id" uuid,
	"module" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"synced_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "product_categories" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_corrected_by_id_users_id_fk" FOREIGN KEY ("corrected_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_of_materials" ADD CONSTRAINT "bill_of_materials_parent_product_id_products_id_fk" FOREIGN KEY ("parent_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_of_materials" ADD CONSTRAINT "bill_of_materials_raw_material_product_id_products_id_fk" FOREIGN KEY ("raw_material_product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recorded_by_id_users_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_stock_id_inventory_stock_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."inventory_stock"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_inspected_by_id_users_id_fk" FOREIGN KEY ("inspected_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tally_offline_queue" ADD CONSTRAINT "tally_offline_queue_integration_id_tally_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."tally_integrations"("id") ON DELETE cascade ON UPDATE no action;