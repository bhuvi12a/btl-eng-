import { z } from 'zod';

// ==============================================================================
// 1. CUSTOMERS VALIDATION SCHEMAS
// ==============================================================================
export const createCustomerSchema = z.object({
    companyName: z.string().min(2, 'Company name is required'),
    contactPerson: z.string().min(2, 'Contact person is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(7, 'Phone number is required'),
    gstNumber: z.string().optional().or(z.literal('')),
    panNumber: z.string().optional().or(z.literal('')),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().default('Tamil Nadu'),
    country: z.string().default('India'),
    pinCode: z.string().min(4, 'PIN code is required'),
    creditLimit: z.string().default('0.00'),
    paymentTerms: z.string().default('30 Days Net'),
    status: z.enum(['active', 'inactive', 'lead']).default('active'),
    notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// ==============================================================================
// 2. SUPPLIERS VALIDATION SCHEMAS
// ==============================================================================
export const createSupplierSchema = z.object({
    companyName: z.string().min(2, 'Supplier company name is required'),
    contactPerson: z.string().min(2, 'Contact person is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(7, 'Phone number is required'),
    gstNumber: z.string().optional().or(z.literal('')),
    panNumber: z.string().optional().or(z.literal('')),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().default('Tamil Nadu'),
    country: z.string().default('India'),
    pinCode: z.string().min(4, 'PIN code is required'),
    paymentTerms: z.string().default('30 Days Net'),
    rating: z.number().int().min(1).max(5).default(5),
    status: z.enum(['active', 'inactive', 'blacklisted']).default('active'),
    notes: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

// ==============================================================================
// 3. PRODUCTS VALIDATION SCHEMAS
// ==============================================================================
export const materialTypes = [
    'Steel',
    'Aluminium',
    'Stainless Steel',
    'Brass',
    'Tool Steel',
    'Other',
] as const;

export const createProductSchema = z.object({
    partNumber: z.string().min(2, 'Part number is required (e.g. BTL-CNC-101)'),
    name: z.string().min(2, 'Product/component name is required'),
    description: z.string().optional(),
    categoryId: z.string().uuid('Category is required'),
    uom: z.string().default('PCS'),
    materialType: z.enum(materialTypes).default('Steel'),
    drawingNumber: z.string().optional(),
    revisionNumber: z.string().default('Rev 0'),
    standardCost: z.string().default('0.00'),
    sellingPrice: z.string().default('0.00'),
    minStockLevel: z.string().default('10.00'),
    maxStockLevel: z.string().default('1000.00'),
    reorderPoint: z.string().default('25.00'),
    hsnCode: z.string().default('8483'),
    mainImageUrl: z.string().min(1, 'Main product photograph is mandatory. Please upload a main image before registering.'),
    isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

// ==============================================================================
// 4. INVENTORY STOCK ADJUSTMENT / TRANSACTION SCHEMAS
// ==============================================================================
export const inventoryTransactionTypes = [
    'purchase_inward',
    'production_issue',
    'production_return',
    'sales_dispatch',
    'adjustment',
    'transfer',
] as const;

export const createStockTransactionSchema = z.object({
    transactionType: z.enum(inventoryTransactionTypes),
    productId: z.string().uuid('Product ID is required'),
    fromWarehouseId: z.string().uuid().optional(),
    toWarehouseId: z.string().uuid().optional(),
    quantity: z.string().min(1, 'Quantity is required'),
    unitCost: z.string().default('0.00'),
    referenceType: z.string().optional(),
    referenceId: z.string().optional(),
    batchNumber: z.string().optional(),
    binLocation: z.string().optional(),
    notes: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateStockTransactionInput = z.infer<typeof createStockTransactionSchema>;

