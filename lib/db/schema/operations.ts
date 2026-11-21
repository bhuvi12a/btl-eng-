import { pgTable, text, timestamp, uuid, date, numeric, pgEnum, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';
import { products } from './products';
import { inventoryStock } from './inventory';
import { tallyIntegrations } from './tally';

export const attendanceStatusEnum = pgEnum('attendance_status', [
    'present',
    'absent',
    'half_day',
    'leave',
    'overtime',
]);

export const shiftEnum = pgEnum('work_shift', [
    'general',
    'shift_1',
    'shift_2',
    'night',
]);

export const expenseCategoryEnum = pgEnum('expense_category', [
    'raw_materials',
    'cnc_tooling_inserts',
    'machine_maintenance',
    'electricity_power',
    'coolant_lubricants',
    'factory_rent',
    'salary_wages',
    'freight_transport',
    'packaging',
    'administrative',
    'other',
]);

export const expenseStatusEnum = pgEnum('expense_status', [
    'pending_approval',
    'approved',
    'rejected',
    'paid',
]);

// 1. Daily Staff & Machinist Attendance with GPS Geofencing and High-Assurance Evidence
export const attendance = pgTable('attendance', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    employeeName: text('employee_name').notNull(),
    employeeCode: text('employee_code').notNull(),
    date: date('date').notNull(),
    status: attendanceStatusEnum('status').default('present').notNull(),
    shift: shiftEnum('shift').default('general').notNull(),
    checkInTime: text('check_in_time'),
    checkOutTime: text('check_out_time'),
    hoursWorked: numeric('hours_worked', { precision: 5, scale: 2 }).default('8.00'),
    overtimeHours: numeric('overtime_hours', { precision: 5, scale: 2 }).default('0.00'),
    latitude: numeric('latitude', { precision: 10, scale: 7 }),
    longitude: numeric('longitude', { precision: 10, scale: 7 }),
    gpsVerified: boolean('gps_verified').default(false).notNull(),
    gpsAccuracyMeters: numeric('gps_accuracy_meters', { precision: 8, scale: 2 }),
    checkInSelfieKey: text('check_in_selfie_key'),
    checkInVideoKey: text('check_in_video_key'),
    checkInVideoDurationMs: integer('check_in_video_duration_ms'),
    checkOutSelfieKey: text('check_out_selfie_key'),
    checkOutVideoKey: text('check_out_video_key'),
    checkOutVideoDurationMs: integer('check_out_video_duration_ms'),
    deviceInfo: text('device_info'),
    consentRecordedAt: timestamp('consent_recorded_at', { withTimezone: true }),
    originalCheckInTime: text('original_check_in_time'),
    originalCheckOutTime: text('original_check_out_time'),
    originalStatus: text('original_status'),
    correctionReason: text('correction_reason'),
    correctedById: uuid('corrected_by_id').references(() => users.id, { onDelete: 'set null' }),
    isArchived: boolean('is_archived').default(false).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Dedicated immutable audit log for Admin / HR corrections
export const attendanceCorrectionsLog = pgTable('attendance_corrections_log', {
    id: uuid('id').defaultRandom().primaryKey(),
    attendanceId: uuid('attendance_id')
        .notNull()
        .references(() => attendance.id, { onDelete: 'cascade' }),
    adminId: uuid('admin_id')
        .notNull()
        .references(() => users.id, { onDelete: 'restrict' }),
    adminEmail: text('admin_email').notNull(),
    fieldChanged: text('field_changed').notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value').notNull(),
    correctionReason: text('correction_reason').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Plant Operating Expenses & Cost Center with Approval Workflow
export const expenses = pgTable('expenses', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    category: expenseCategoryEnum('category').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0.00'),
    status: expenseStatusEnum('status').default('approved').notNull(),
    expenseDate: date('expense_date').notNull(),
    paymentMode: text('payment_mode').default('Bank Transfer'),
    vendorName: text('vendor_name'),
    invoiceNumber: text('invoice_number'),
    receiptUrl: text('receipt_url'),
    recordedById: uuid('recorded_by_id').references(() => users.id, { onDelete: 'set null' }),
    approvedById: uuid('approved_by_id').references(() => users.id, { onDelete: 'set null' }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Bill of Materials (BOM) & Component Production Costing
export const billOfMaterials = pgTable('bill_of_materials', {
    id: uuid('id').defaultRandom().primaryKey(),
    parentProductId: uuid('parent_product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'cascade' }),
    rawMaterialProductId: uuid('raw_material_product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'restrict' }),
    quantityRequired: numeric('quantity_required', { precision: 12, scale: 4 }).notNull(),
    scrapAllowancePercent: numeric('scrap_allowance_percent', { precision: 5, scale: 2 }).default('5.00').notNull(),
    machiningTimeMinutes: numeric('machining_time_minutes', { precision: 6, scale: 2 }).default('10.00').notNull(),
    toolingCostPerUnit: numeric('tooling_cost_per_unit', { precision: 10, scale: 2 }).default('0.00').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Quality Inspection & Rejection Tracking
export const qualityInspections = pgTable('quality_inspections', {
    id: uuid('id').defaultRandom().primaryKey(),
    stockId: uuid('stock_id').references(() => inventoryStock.id, { onDelete: 'set null' }),
    productId: uuid('product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'cascade' }),
    batchNumber: text('batch_number'),
    inspectedQuantity: numeric('inspected_quantity', { precision: 12, scale: 2 }).notNull(),
    passedQuantity: numeric('passed_quantity', { precision: 12, scale: 2 }).notNull(),
    rejectedQuantity: numeric('rejected_quantity', { precision: 12, scale: 2 }).notNull(),
    rejectionReason: text('rejection_reason'),
    rejectionPercentage: numeric('rejection_percentage', { precision: 5, scale: 2 }).default('0.00'),
    inspectedById: uuid('inspected_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Tally Offline Sync Queue
export const tallyOfflineQueue = pgTable('tally_offline_queue', {
    id: uuid('id').defaultRandom().primaryKey(),
    integrationId: uuid('integration_id').references(() => tallyIntegrations.id, { onDelete: 'cascade' }),
    module: text('module').notNull(),
    payload: jsonb('payload').notNull(),
    status: text('status').default('queued').notNull(), // 'queued', 'synced', 'failed'
    retryCount: integer('retry_count').default(0).notNull(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    syncedAt: timestamp('synced_at', { withTimezone: true }),
});

// Relations
export const attendanceRelations = relations(attendance, ({ one }) => ({
    user: one(users, {
        fields: [attendance.userId],
        references: [users.id],
    }),
    correctedBy: one(users, {
        fields: [attendance.correctedById],
        references: [users.id],
    }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
    recordedBy: one(users, {
        fields: [expenses.recordedById],
        references: [users.id],
    }),
    approvedBy: one(users, {
        fields: [expenses.approvedById],
        references: [users.id],
    }),
}));

export const billOfMaterialsRelations = relations(billOfMaterials, ({ one }) => ({
    parentProduct: one(products, {
        fields: [billOfMaterials.parentProductId],
        references: [products.id],
    }),
    rawMaterial: one(products, {
        fields: [billOfMaterials.rawMaterialProductId],
        references: [products.id],
    }),
}));

export const qualityInspectionsRelations = relations(qualityInspections, ({ one }) => ({
    product: one(products, {
        fields: [qualityInspections.productId],
        references: [products.id],
    }),
    stock: one(inventoryStock, {
        fields: [qualityInspections.stockId],
        references: [inventoryStock.id],
    }),
    inspectedBy: one(users, {
        fields: [qualityInspections.inspectedById],
        references: [users.id],
    }),
}));

export const tallyOfflineQueueRelations = relations(tallyOfflineQueue, ({ one }) => ({
    integration: one(tallyIntegrations, {
        fields: [tallyOfflineQueue.integrationId],
        references: [tallyIntegrations.id],
    }),
}));
