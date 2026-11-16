import { z } from 'zod';

export const tallyModules = [
    'customers',
    'suppliers',
    'products',
    'stock_items',
    'sales_invoices',
    'purchase_invoices',
    'payment_vouchers',
    'receipt_vouchers',
    'expense_vouchers',
] as const;

export const tallySyncDirections = ['export_to_tally', 'import_from_tally'] as const;

export const connectTallySchema = z.object({
    connectorId: z.string().min(1, 'Connector Device ID is required'),
    companyName: z.string().min(2, 'Company name is required'),
    tallyCompanyId: z.string().min(1, 'Tally Company ID is required'),
});

export const syncModuleSchema = z.object({
    module: z.enum(tallyModules),
    syncDirection: z.enum(tallySyncDirections).default('export_to_tally'),
    previewOnly: z.boolean().default(false),
    idempotencyKey: z.string().optional(),
});

export const connectorHeartbeatSchema = z.object({
    connectorId: z.string(),
    token: z.string(),
    deviceName: z.string(),
    tallyHost: z.string().default('localhost'),
    tallyPort: z.number().default(9000),
    tallyVersion: z.string().optional(),
    companies: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            isCurrent: z.boolean().default(false),
        })
    ).optional(),
});

export const connectorSyncResultSchema = z.object({
    syncLogId: z.string().uuid(),
    token: z.string(),
    successfulRecords: z.number().int().min(0),
    failedRecords: z.number().int().min(0),
    syncStatus: z.enum(['completed', 'failed', 'partial']),
    errorDetails: z.any().optional(),
});

export type ConnectTallyInput = z.infer<typeof connectTallySchema>;
export type SyncModuleInput = z.infer<typeof syncModuleSchema>;
export type ConnectorHeartbeatInput = z.infer<typeof connectorHeartbeatSchema>;
export type ConnectorSyncResultInput = z.infer<typeof connectorSyncResultSchema>;

