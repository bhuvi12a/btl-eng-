import { pgTable, text, timestamp, uuid, integer, pgEnum } from 'drizzle-orm/pg-core';

export const supplierStatusEnum = pgEnum('supplier_status', ['active', 'inactive', 'blacklisted']);

export const suppliers = pgTable('suppliers', {
    id: uuid('id').defaultRandom().primaryKey(),
    companyName: text('company_name').notNull(),
    contactPerson: text('contact_person').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    gstNumber: text('gst_number'),
    panNumber: text('pan_number'),
    address: text('address').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    country: text('country').default('India').notNull(),
    pinCode: text('pin_code').notNull(),
    paymentTerms: text('payment_terms').default('30 Days Net'),
    rating: integer('rating').default(5), // 1 to 5 star supplier rating
    status: supplierStatusEnum('status').default('active').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

