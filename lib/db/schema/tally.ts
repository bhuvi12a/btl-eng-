import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

// Tally Enums
export const tallyConnectionStatusEnum = pgEnum('tally_connection_status', [
    'connected',
    'disconnected',
    'error',
]);

export const tallyDeviceStatusEnum = pgEnum('tally_device_status', [
    'online',
    'offline',
    'error',
]);

export const tallySyncDirectionEnum = pgEnum('tally_sync_direction', [
    'export_to_tally',
    'import_from_tally',
]);

export const tallySyncStatusEnum = pgEnum('tally_sync_status', [
    'in_progress',
    'completed',
    'failed',
    'partial',
]);

export const tallyModuleEnum = pgEnum('tally_module', [
    'customers',
    'suppliers',
    'products',
    'stock_items',
    'sales_invoices',
    'purchase_invoices',
    'payment_vouchers',
    'receipt_vouchers',
    'expense_vouchers',
]);

// 1. Tally Connector Devices (Local Windows Agent Registered with Cloud ERP)
export const tallyConnectorDevices = pgTable(
    'tally_connector_devices',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        connectorId: text('connector_id').notNull().unique(), // e.g. 'BTL-WIN-CONNECTOR-01'
        deviceName: text('device_name').notNull(), // e.g. 'Accounts-Dell-Workstation'
        deviceStatus: tallyDeviceStatusEnum('device_status').default('offline').notNull(),
        tokenHash: text('token_hash').notNull(), // SHA-256 hashed connector secret
        ipAddress: text('ip_address'),
        tallyHost: text('tally_host').default('localhost').notNull(),
        tallyPort: integer('tally_port').default(9000).notNull(),
        tallyVersion: text('tally_version'),
        lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index('idx_connector_id').on(table.connectorId),
        index('idx_connector_status').on(table.deviceStatus),
    ]
);

// 2. Tally Integrations Master (Connection State & Selected Company)
export const tallyIntegrations = pgTable(
    'tally_integrations',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        companyName: text('company_name'), // e.g. 'BTL AUTOMOTIVE ENGINEERING PVT LTD'
        tallyCompanyId: text('tally_company_id'), // Tally internal company identifier
        connectionStatus: tallyConnectionStatusEnum('connection_status').default('disconnected').notNull(),
        connectorId: text('connector_id').references(() => tallyConnectorDevices.connectorId, { onDelete: 'set null' }),
        connectedById: uuid('connected_by_id').references(() => users.id, { onDelete: 'set null' }),
        connectedAt: timestamp('connected_at', { withTimezone: true }),
        lastConnectedAt: timestamp('last_connected_at', { withTimezone: true }),
        lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
        isActive: boolean('is_active').default(true).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index('idx_tally_integration_status').on(table.connectionStatus),
    ]
);

// 3. Tally Synchronization Logs (Detailed Audit & History)
export const tallySyncLogs = pgTable(
    'tally_sync_logs',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        integrationId: uuid('integration_id')
            .notNull()
            .references(() => tallyIntegrations.id, { onDelete: 'cascade' }),
        module: tallyModuleEnum('module').notNull(),
        syncDirection: tallySyncDirectionEnum('sync_direction').notNull(),
        totalRecords: integer('total_records').default(0).notNull(),
        successfulRecords: integer('successful_records').default(0).notNull(),
        failedRecords: integer('failed_records').default(0).notNull(),
        syncStatus: tallySyncStatusEnum('sync_status').default('in_progress').notNull(),
        errorDetails: jsonb('error_details'), // Stores array of failed record details and messages
        idempotencyKey: text('idempotency_key').unique(), // Prevents duplicate sync requests
        initiatedById: uuid('initiated_by_id').references(() => users.id, { onDelete: 'set null' }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index('idx_sync_logs_integration').on(table.integrationId),
        index('idx_sync_logs_module').on(table.module),
        index('idx_sync_logs_created').on(table.createdAt),
    ]
);

// 4. Tally Entity Mappings (Bi-directional ID matching between BTL ERP and Tally GUIDs)
export const tallyEntityMappings = pgTable(
    'tally_entity_mappings',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        integrationId: uuid('integration_id')
            .notNull()
            .references(() => tallyIntegrations.id, { onDelete: 'cascade' }),
        entityType: text('entity_type').notNull(), // 'customer', 'supplier', 'product', 'invoice', etc.
        erpRecordId: text('erp_record_id').notNull(), // UUID or code in BTL ERP
        tallyRecordId: text('tally_record_id').notNull(), // Tally Master ID or GUID
        tallyName: text('tally_name').notNull(), // Exact Name in Tally Prime ledger / item
        lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index('idx_entity_mapping_lookup').on(table.integrationId, table.entityType, table.erpRecordId),
        index('idx_entity_mapping_tally_id').on(table.integrationId, table.tallyRecordId),
    ]
);

// Relations
export const tallyConnectorDevicesRelations = relations(tallyConnectorDevices, ({ many }) => ({
    integrations: many(tallyIntegrations),
}));

export const tallyIntegrationsRelations = relations(tallyIntegrations, ({ one, many }) => ({
    connector: one(tallyConnectorDevices, {
        fields: [tallyIntegrations.connectorId],
        references: [tallyConnectorDevices.connectorId],
    }),
    connectedBy: one(users, {
        fields: [tallyIntegrations.connectedById],
        references: [users.id],
    }),
    syncLogs: many(tallySyncLogs),
    mappings: many(tallyEntityMappings),
}));

export const tallySyncLogsRelations = relations(tallySyncLogs, ({ one }) => ({
    integration: one(tallyIntegrations, {
        fields: [tallySyncLogs.integrationId],
        references: [tallyIntegrations.id],
    }),
    initiatedBy: one(users, {
        fields: [tallySyncLogs.initiatedById],
        references: [users.id],
    }),
}));

export const tallyEntityMappingsRelations = relations(tallyEntityMappings, ({ one }) => ({
    integration: one(tallyIntegrations, {
        fields: [tallyEntityMappings.integrationId],
        references: [tallyIntegrations.id],
    }),
}));

