-- ======================================================================
-- BTL Automotive & Aerospace Engineering ERP — Database Security Hardening
-- Migration: 0001_enable_least_privilege_rls_and_grants.sql
-- Generated: 2026-11-18T11:03:26.865Z
-- Scope: Restricts direct anonymous/authenticated PostgREST exploitation
-- ======================================================================

BEGIN;

-- 1. REVOKE DEFAULT DANGEROUS GRANTS FROM PUBLIC ROLES
-- Revokes direct table modification via anon/authenticated PostgREST keys.
-- All production mutations execute safely via server-side session-guarded pooler.
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."attendance" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."attendance" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."attendance_corrections_log" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."attendance_corrections_log" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."audit_logs" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."audit_logs" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."bill_of_materials" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."bill_of_materials" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."credit_debit_notes" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."credit_debit_notes" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."customer_payments" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."customer_payments" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."customers" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."customers" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."departments" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."departments" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."employees" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."employees" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."expenses" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."expenses" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."inventory_stock" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."inventory_stock" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."inventory_transactions" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."inventory_transactions" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."invoices" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."invoices" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."permissions" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."permissions" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."product_categories" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."product_categories" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."product_documents" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."product_documents" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."product_images" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."product_images" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."products" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."products" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."purchase_orders" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."purchase_orders" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."quality_inspections" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."quality_inspections" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."role_permissions" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."role_permissions" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."roles" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."roles" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."suppliers" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."suppliers" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."tally_connector_devices" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."tally_connector_devices" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."tally_entity_mappings" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."tally_entity_mappings" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."tally_integrations" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."tally_integrations" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."tally_offline_queue" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."tally_offline_queue" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."tally_sync_logs" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."tally_sync_logs" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."user_sessions" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."user_sessions" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."users" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."users" FROM authenticated;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."warehouses" FROM anon;
REVOKE TRUNCATE, DELETE, INSERT, UPDATE ON TABLE "public"."warehouses" FROM authenticated;

-- 2. ENSURE RLS IS ENABLED ON ALL TABLES
ALTER TABLE "public"."attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."attendance_corrections_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."bill_of_materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."credit_debit_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."customer_payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."inventory_stock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."inventory_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."purchase_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."quality_inspections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tally_connector_devices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tally_entity_mappings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tally_integrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tally_offline_queue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tally_sync_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."warehouses" ENABLE ROW LEVEL SECURITY;

-- 3. DEFINE LEAST-PRIVILEGE POLICIES PER DOMAIN

-- Domain A: Attendance
DROP POLICY IF EXISTS "attendance_employee_own_records" ON "public"."attendance";
CREATE POLICY "attendance_employee_own_records" ON "public"."attendance"
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id 
        OR (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'hr')
    );

-- Domain B: Audit Logs
DROP POLICY IF EXISTS "audit_logs_admin_read_only" ON "public"."audit_logs";
CREATE POLICY "audit_logs_admin_read_only" ON "public"."audit_logs"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin')
    );

-- Domain C: Financials
DROP POLICY IF EXISTS "invoices_erp_access" ON "public"."invoices";
CREATE POLICY "invoices_erp_access" ON "public"."invoices"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'accountant')
    );
DROP POLICY IF EXISTS "customer_payments_erp_access" ON "public"."customer_payments";
CREATE POLICY "customer_payments_erp_access" ON "public"."customer_payments"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'accountant')
    );
DROP POLICY IF EXISTS "expenses_erp_access" ON "public"."expenses";
CREATE POLICY "expenses_erp_access" ON "public"."expenses"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'accountant')
    );
DROP POLICY IF EXISTS "credit_debit_notes_erp_access" ON "public"."credit_debit_notes";
CREATE POLICY "credit_debit_notes_erp_access" ON "public"."credit_debit_notes"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'accountant')
    );

-- Domain D: CRM
DROP POLICY IF EXISTS "customers_erp_access" ON "public"."customers";
CREATE POLICY "customers_erp_access" ON "public"."customers"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager')
    );
DROP POLICY IF EXISTS "suppliers_erp_access" ON "public"."suppliers";
CREATE POLICY "suppliers_erp_access" ON "public"."suppliers"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager')
    );

-- Domain E: Products & Inventory
DROP POLICY IF EXISTS "products_erp_access" ON "public"."products";
CREATE POLICY "products_erp_access" ON "public"."products"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'engineer', 'store_manager', 'quality_inspector')
    );
DROP POLICY IF EXISTS "product_categories_erp_access" ON "public"."product_categories";
CREATE POLICY "product_categories_erp_access" ON "public"."product_categories"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'engineer', 'store_manager', 'quality_inspector')
    );
DROP POLICY IF EXISTS "product_images_erp_access" ON "public"."product_images";
CREATE POLICY "product_images_erp_access" ON "public"."product_images"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'engineer', 'store_manager', 'quality_inspector')
    );
DROP POLICY IF EXISTS "product_documents_erp_access" ON "public"."product_documents";
CREATE POLICY "product_documents_erp_access" ON "public"."product_documents"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'engineer', 'store_manager', 'quality_inspector')
    );
DROP POLICY IF EXISTS "inventory_stock_erp_access" ON "public"."inventory_stock";
CREATE POLICY "inventory_stock_erp_access" ON "public"."inventory_stock"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'engineer', 'store_manager', 'quality_inspector')
    );
DROP POLICY IF EXISTS "inventory_transactions_erp_access" ON "public"."inventory_transactions";
CREATE POLICY "inventory_transactions_erp_access" ON "public"."inventory_transactions"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'engineer', 'store_manager', 'quality_inspector')
    );
DROP POLICY IF EXISTS "warehouses_erp_access" ON "public"."warehouses";
CREATE POLICY "warehouses_erp_access" ON "public"."warehouses"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'engineer', 'store_manager', 'quality_inspector')
    );
DROP POLICY IF EXISTS "purchase_orders_erp_access" ON "public"."purchase_orders";
CREATE POLICY "purchase_orders_erp_access" ON "public"."purchase_orders"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'engineer', 'store_manager', 'quality_inspector')
    );
DROP POLICY IF EXISTS "quality_inspections_erp_access" ON "public"."quality_inspections";
CREATE POLICY "quality_inspections_erp_access" ON "public"."quality_inspections"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'engineer', 'store_manager', 'quality_inspector')
    );
DROP POLICY IF EXISTS "bill_of_materials_erp_access" ON "public"."bill_of_materials";
CREATE POLICY "bill_of_materials_erp_access" ON "public"."bill_of_materials"
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'manager', 'engineer', 'store_manager', 'quality_inspector')
    );

-- Domain F: Users & Sessions
DROP POLICY IF EXISTS "users_self_or_admin" ON "public"."users";
CREATE POLICY "users_self_or_admin" ON "public"."users"
    FOR SELECT TO authenticated
    USING (
        auth.uid() = id OR (auth.jwt() ->> 'role') IN ('super_admin', 'admin')
    );

COMMIT;
