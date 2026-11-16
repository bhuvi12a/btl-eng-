import { pgTable, text, timestamp, uuid, numeric, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { products } from './products';
import { users } from './auth';

export const inventoryTransactionTypeEnum = pgEnum('inventory_transaction_type', [
    'purchase_inward',
    'production_issue',
    'production_return',
    'sales_dispatch',
    'adjustment',
    'transfer',
]);

// Warehouses Master (e.g. 'Hosur Main Plant Store', 'Raw Material Yard', 'Finished Goods Store')
export const warehouses = pgTable('warehouses', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    code: text('code').notNull().unique(), // e.g. 'WH-MAIN', 'WH-RM'
    location: text('location').default('Hosur Plant, Tamil Nadu').notNull(),
    managerId: uuid('manager_id').references(() => users.id, { onDelete: 'set null' }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Real-time Inventory Stock Ledger per Product per Warehouse
export const inventoryStock = pgTable('inventory_stock', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'cascade' }),
    warehouseId: uuid('warehouse_id')
        .notNull()
        .references(() => warehouses.id, { onDelete: 'cascade' }),
    quantity: numeric('quantity', { precision: 12, scale: 2 }).default('0.00').notNull(),
    reservedQuantity: numeric('reserved_quantity', { precision: 12, scale: 2 }).default('0.00').notNull(),
    binLocation: text('bin_location'), // e.g. 'RACK-A1-BIN-04'
    batchNumber: text('batch_number'),
    lastInspectedAt: timestamp('last_inspected_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Inventory Transactions History (Audit Trail)
export const inventoryTransactions = pgTable('inventory_transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    transactionType: inventoryTransactionTypeEnum('transaction_type').notNull(),
    productId: uuid('product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'restrict' }),
    fromWarehouseId: uuid('from_warehouse_id').references(() => warehouses.id, { onDelete: 'set null' }),
    toWarehouseId: uuid('to_warehouse_id').references(() => warehouses.id, { onDelete: 'set null' }),
    quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
    unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).default('0.00').notNull(),
    referenceType: text('reference_type'), // 'purchase_order', 'production_order', 'sales_order', 'tally_sync'
    referenceId: text('reference_id'),
    batchNumber: text('batch_number'),
    notes: text('notes'),
    performedById: uuid('performed_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const warehousesRelations = relations(warehouses, ({ one, many }) => ({
    manager: one(users, {
        fields: [warehouses.managerId],
        references: [users.id],
    }),
    stockItems: many(inventoryStock),
}));

export const inventoryStockRelations = relations(inventoryStock, ({ one }) => ({
    product: one(products, {
        fields: [inventoryStock.productId],
        references: [products.id],
    }),
    warehouse: one(warehouses, {
        fields: [inventoryStock.warehouseId],
        references: [warehouses.id],
    }),
}));

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
    product: one(products, {
        fields: [inventoryTransactions.productId],
        references: [products.id],
    }),
    fromWarehouse: one(warehouses, {
        fields: [inventoryTransactions.fromWarehouseId],
        references: [warehouses.id],
    }),
    toWarehouse: one(warehouses, {
        fields: [inventoryTransactions.toWarehouseId],
        references: [warehouses.id],
    }),
    performedBy: one(users, {
        fields: [inventoryTransactions.performedById],
        references: [users.id],
    }),
}));

