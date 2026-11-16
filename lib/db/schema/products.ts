import { pgTable, text, timestamp, uuid, numeric, boolean, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

export const materialTypeEnum = pgEnum('material_type', [
    'Steel',
    'Aluminium',
    'Stainless Steel',
    'Brass',
    'Tool Steel',
    'Other',
]);

// Product Categories (e.g., 'Turned Components', 'Milled Housings', 'Shafts', 'Fasteners', 'Raw Material')
export const productCategories = pgTable('product_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    code: text('code').notNull().unique(), // e.g., 'CAT-TRN', 'CAT-MIL'
    description: text('description'),
    imageUrl: text('image_url'), // Category representative photo / preview image
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Products / Components Master
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    partNumber: text('part_number').notNull().unique(), // e.g. 'BTL-CNC-101'
    name: text('name').notNull(),
    description: text('description'),
    categoryId: uuid('category_id')
        .notNull()
        .references(() => productCategories.id, { onDelete: 'restrict' }),
    uom: text('uom').default('PCS').notNull(), // 'PCS', 'NOS', 'KG', 'SET'
    materialType: materialTypeEnum('material_type').default('Steel').notNull(),
    drawingNumber: text('drawing_number'), // e.g. 'DWG-BTL-2024-401'
    revisionNumber: text('revision_number').default('Rev 0').notNull(),
    standardCost: numeric('standard_cost', { precision: 12, scale: 2 }).default('0.00').notNull(),
    sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).default('0.00').notNull(),
    minStockLevel: numeric('min_stock_level', { precision: 12, scale: 2 }).default('0.00').notNull(),
    maxStockLevel: numeric('max_stock_level', { precision: 12, scale: 2 }).default('0.00').notNull(),
    reorderPoint: numeric('reorder_point', { precision: 12, scale: 2 }).default('0.00').notNull(),
    hsnCode: text('hsn_code').default('8483'), // Harmonized System Nomenclature for engineering components
    mainImageUrl: text('main_image_url'), // Main primary photo
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Multi-Image Gallery Table
export const productImages = pgTable('product_images', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    fileName: text('file_name').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: text('mime_type').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    uploadedById: uuid('uploaded_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Technical Documents (CAD, Datasheets, Certificates) Table
export const productDocuments = pgTable('product_documents', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
        .notNull()
        .references(() => products.id, { onDelete: 'cascade' }),
    documentType: text('document_type').notNull(), // 'datasheet', 'technical_spec', 'engineering_drawing', 'cad_pdf', 'certificate'
    title: text('title').notNull(),
    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: text('mime_type').notNull(),
    revision: text('revision').default('Rev 0').notNull(),
    uploadedById: uuid('uploaded_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
    products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(productCategories, {
        fields: [products.categoryId],
        references: [productCategories.id],
    }),
    images: many(productImages),
    documents: many(productDocuments),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
        fields: [productImages.productId],
        references: [products.id],
    }),
    uploadedBy: one(users, {
        fields: [productImages.uploadedById],
        references: [users.id],
    }),
}));

export const productDocumentsRelations = relations(productDocuments, ({ one }) => ({
    product: one(products, {
        fields: [productDocuments.productId],
        references: [products.id],
    }),
    uploadedBy: one(users, {
        fields: [productDocuments.uploadedById],
        references: [users.id],
    }),
}));
