import { pgTable, text, timestamp, uuid, numeric, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

export const customerStatusEnum = pgEnum('customer_status', ['active', 'inactive', 'lead']);

export const customers = pgTable('customers', {
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
    creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }).default('0.00'),
    paymentTerms: text('payment_terms').default('30 Days Net'), // e.g., 'Advance', '15 Days Net', '30 Days Net'
    status: customerStatusEnum('status').default('active').notNull(),
    notes: text('notes'),
    assignedToId: uuid('assigned_to_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customersRelations = relations(customers, ({ one }) => ({
    assignedTo: one(users, {
        fields: [customers.assignedToId],
        references: [users.id],
    }),
}));

