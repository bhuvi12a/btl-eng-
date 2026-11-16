import { pgTable, text, timestamp, uuid, numeric, boolean, date, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { customers } from './crm';
import { users } from './auth';

// 1. Invoices Table
export const invoices = pgTable('invoices', {
    id: uuid('id').defaultRandom().primaryKey(),
    invoiceNumber: text('invoice_number').notNull().unique(), // e.g., 'INV-BTL-2026-001'
    customerId: uuid('customer_id')
        .notNull()
        .references(() => customers.id, { onDelete: 'restrict' }),
    orderNumber: text('order_number'), // e.g. 'SO-BTL-2026-081'
    invoiceDate: date('invoice_date').notNull(),
    dueDate: date('due_date').notNull(),
    subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
    totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
    amountPaid: numeric('amount_paid', { precision: 12, scale: 2 }).default('0.00').notNull(),
    balanceDue: numeric('balance_due', { precision: 12, scale: 2 }).notNull(),
    status: text('status').default('unpaid').notNull(), // 'draft', 'unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled'
    items: jsonb('items').notNull(), // array of line items: partNumber, description, quantity, unitPrice, hsnCode, taxRate, amount
    tallyGuid: text('tally_guid'),
    tallySynced: boolean('tally_synced').default(false).notNull(),
    tallySyncedAt: timestamp('tally_synced_at', { withTimezone: true }),
    pdfUrl: text('pdf_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Customer Payments / Receipts Table (with duplicate UTR prevention)
export const customerPayments = pgTable('customer_payments', {
    id: uuid('id').defaultRandom().primaryKey(),
    receiptNumber: text('receipt_number').notNull().unique(), // e.g., 'REC-BTL-2026-001'
    customerId: uuid('customer_id')
        .notNull()
        .references(() => customers.id, { onDelete: 'restrict' }),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
    paymentDate: date('payment_date').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    paymentMode: text('payment_mode').default('NEFT/RTGS').notNull(), // 'NEFT/RTGS', 'Cheque', 'UPI', 'Bank Transfer', 'Cash'
    referenceNumber: text('reference_number').notNull().unique(), // UTR / Cheque # - prevents duplicate payments!
    bankName: text('bank_name'),
    notes: text('notes'),
    recordedById: uuid('recorded_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Credit & Debit Notes Table
export const creditDebitNotes = pgTable('credit_debit_notes', {
    id: uuid('id').defaultRandom().primaryKey(),
    noteNumber: text('note_number').notNull().unique(), // e.g., 'CN-BTL-2026-001' or 'DN-BTL-2026-001'
    noteType: text('note_type').notNull(), // 'credit_note' (reduces receivable) or 'debit_note' (increases receivable)
    customerId: uuid('customer_id')
        .notNull()
        .references(() => customers.id, { onDelete: 'restrict' }),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
    issueDate: date('issue_date').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
    totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
    reason: text('reason').notNull(), // 'Rejection in QA', 'Scrap Allowance Adjustment', 'Price Difference', 'Damaged in Transit'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    customer: one(customers, {
        fields: [invoices.customerId],
        references: [customers.id],
    }),
    payments: many(customerPayments),
    notes: many(creditDebitNotes),
}));

export const customerPaymentsRelations = relations(customerPayments, ({ one }) => ({
    customer: one(customers, {
        fields: [customerPayments.customerId],
        references: [customers.id],
    }),
    invoice: one(invoices, {
        fields: [customerPayments.invoiceId],
        references: [invoices.id],
    }),
}));

export const creditDebitNotesRelations = relations(creditDebitNotes, ({ one }) => ({
    customer: one(customers, {
        fields: [creditDebitNotes.customerId],
        references: [customers.id],
    }),
    invoice: one(invoices, {
        fields: [creditDebitNotes.invoiceId],
        references: [invoices.id],
    }),
}));

