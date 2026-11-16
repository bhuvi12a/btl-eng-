CREATE TYPE "public"."customer_status" AS ENUM('active', 'inactive', 'lead');--> statement-breakpoint
CREATE TYPE "public"."supplier_status" AS ENUM('active', 'inactive', 'blacklisted');--> statement-breakpoint
CREATE TYPE "public"."material_type" AS ENUM('Steel', 'Aluminium', 'Stainless Steel', 'Brass', 'Tool Steel', 'Other');--> statement-breakpoint
CREATE TYPE "public"."inventory_transaction_type" AS ENUM('purchase_inward', 'production_issue', 'production_return', 'sales_dispatch', 'adjustment', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."tally_connection_status" AS ENUM('connected', 'disconnected', 'error');--> statement-breakpoint
CREATE TYPE "public"."tally_device_status" AS ENUM('online', 'offline', 'error');--> statement-breakpoint
CREATE TYPE "public"."tally_module" AS ENUM('customers', 'suppliers', 'products', 'stock_items', 'sales_invoices', 'purchase_invoices', 'payment_vouchers', 'receipt_vouchers', 'expense_vouchers');--> statement-breakpoint
CREATE TYPE "public"."tally_sync_direction" AS ENUM('export_to_tally', 'import_from_tally');--> statement-breakpoint
CREATE TYPE "public"."tally_sync_status" AS ENUM('in_progress', 'completed', 'failed', 'partial');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"contact_person" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"gst_number" text,
	"pan_number" text,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"country" text DEFAULT 'India' NOT NULL,
	"pin_code" text NOT NULL,
	"credit_limit" numeric(12, 2) DEFAULT '0.00',
	"payment_terms" text DEFAULT '30 Days Net',
	"status" "customer_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"assigned_to_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"contact_person" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"gst_number" text,
	"pan_number" text,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"country" text DEFAULT 'India' NOT NULL,
	"pin_code" text NOT NULL,
	"payment_terms" text DEFAULT '30 Days Net',
	"rating" integer DEFAULT 5,
	"status" "supplier_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "product_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"part_number" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category_id" uuid NOT NULL,
	"uom" text DEFAULT 'PCS' NOT NULL,
	"material_type" "material_type" DEFAULT 'Steel' NOT NULL,
	"drawing_number" text,
	"revision_number" text DEFAULT 'Rev 0' NOT NULL,
	"standard_cost" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"selling_price" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"min_stock_level" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"max_stock_level" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"reorder_point" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"hsn_code" text DEFAULT '8483',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_part_number_unique" UNIQUE("part_number")
);
--> statement-breakpoint
CREATE TABLE "inventory_stock" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"quantity" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"reserved_quantity" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"bin_location" text,
	"batch_number" text,
	"last_inspected_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_type" "inventory_transaction_type" NOT NULL,
	"product_id" uuid NOT NULL,
	"from_warehouse_id" uuid,
	"to_warehouse_id" uuid,
	"quantity" numeric(12, 2) NOT NULL,
	"unit_cost" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"reference_type" text,
	"reference_id" text,
	"batch_number" text,
	"notes" text,
	"performed_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"location" text DEFAULT 'Hosur Plant, Tamil Nadu' NOT NULL,
	"manager_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warehouses_name_unique" UNIQUE("name"),
	CONSTRAINT "warehouses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tally_connector_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connector_id" text NOT NULL,
	"device_name" text NOT NULL,
	"device_status" "tally_device_status" DEFAULT 'offline' NOT NULL,
	"token_hash" text NOT NULL,
	"ip_address" text,
	"tally_host" text DEFAULT 'localhost' NOT NULL,
	"tally_port" integer DEFAULT 9000 NOT NULL,
	"tally_version" text,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tally_connector_devices_connector_id_unique" UNIQUE("connector_id")
);
--> statement-breakpoint
CREATE TABLE "tally_entity_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"integration_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"erp_record_id" text NOT NULL,
	"tally_record_id" text NOT NULL,
	"tally_name" text NOT NULL,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tally_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text,
	"tally_company_id" text,
	"connection_status" "tally_connection_status" DEFAULT 'disconnected' NOT NULL,
	"connector_id" text,
	"connected_by_id" uuid,
	"connected_at" timestamp with time zone,
	"last_connected_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tally_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"integration_id" uuid NOT NULL,
	"module" "tally_module" NOT NULL,
	"sync_direction" "tally_sync_direction" NOT NULL,
	"total_records" integer DEFAULT 0 NOT NULL,
	"successful_records" integer DEFAULT 0 NOT NULL,
	"failed_records" integer DEFAULT 0 NOT NULL,
	"sync_status" "tally_sync_status" DEFAULT 'in_progress' NOT NULL,
	"error_details" jsonb,
	"idempotency_key" text,
	"initiated_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tally_sync_logs_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_from_warehouse_id_warehouses_id_fk" FOREIGN KEY ("from_warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_to_warehouse_id_warehouses_id_fk" FOREIGN KEY ("to_warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tally_entity_mappings" ADD CONSTRAINT "tally_entity_mappings_integration_id_tally_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."tally_integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tally_integrations" ADD CONSTRAINT "tally_integrations_connector_id_tally_connector_devices_connector_id_fk" FOREIGN KEY ("connector_id") REFERENCES "public"."tally_connector_devices"("connector_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tally_integrations" ADD CONSTRAINT "tally_integrations_connected_by_id_users_id_fk" FOREIGN KEY ("connected_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tally_sync_logs" ADD CONSTRAINT "tally_sync_logs_integration_id_tally_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."tally_integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tally_sync_logs" ADD CONSTRAINT "tally_sync_logs_initiated_by_id_users_id_fk" FOREIGN KEY ("initiated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_connector_id" ON "tally_connector_devices" USING btree ("connector_id");--> statement-breakpoint
CREATE INDEX "idx_connector_status" ON "tally_connector_devices" USING btree ("device_status");--> statement-breakpoint
CREATE INDEX "idx_entity_mapping_lookup" ON "tally_entity_mappings" USING btree ("integration_id","entity_type","erp_record_id");--> statement-breakpoint
CREATE INDEX "idx_entity_mapping_tally_id" ON "tally_entity_mappings" USING btree ("integration_id","tally_record_id");--> statement-breakpoint
CREATE INDEX "idx_tally_integration_status" ON "tally_integrations" USING btree ("connection_status");--> statement-breakpoint
CREATE INDEX "idx_sync_logs_integration" ON "tally_sync_logs" USING btree ("integration_id");--> statement-breakpoint
CREATE INDEX "idx_sync_logs_module" ON "tally_sync_logs" USING btree ("module");--> statement-breakpoint
CREATE INDEX "idx_sync_logs_created" ON "tally_sync_logs" USING btree ("created_at");