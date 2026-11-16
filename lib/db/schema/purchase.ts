import { pgTable, text, timestamp, uuid, numeric, date, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { suppliers } from './suppliers';
import { users } from './auth';

export const purchaseOrders = pgTable('purchase_orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    poNumber: text('po_number').notNull().unique(), // e.g. 'PO-BTL-2026-001'
    supplierId: uuid('supplier_id')
        .notNull()
        .references(() => suppliers.id, { onDelete: 'restrict' }),
    orderDate: date('order_date').notNull(),
    expectedDeliveryDate: date('expected_delivery_date'),
    subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
    totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
    status: text('status').default('sent').notNull(), // 'draft', 'sent', 'partially_received', 'received', 'cancelled'
    items: jsonb('items').notNull(), // Array of items: { productId, partNumber, description, quantity, unitPrice, receivedQuantity, uom }
    notes: text('notes'),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
    supplier: one(suppliers, {
        fields: [purchaseOrders.supplierId],
        references: [suppliers.id],
    }),
    createdBy: one(users, {
        fields: [purchaseOrders.createdById],
        references: [users.id],
    }),
}));

