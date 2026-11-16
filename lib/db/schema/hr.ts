import { pgTable, text, timestamp, boolean, uuid, numeric, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

// Departments table
export const departments = pgTable('departments', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(), // e.g. 'CNC Machining', 'Quality Assurance', 'Engineering'
    code: text('code').notNull().unique(), // e.g. 'CNC', 'QA', 'ENG', 'HR'
    description: text('description'),
    managerId: uuid('manager_id'), // Set after users table initialized
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Employees table
export const employees = pgTable('employees', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    employeeCode: text('employee_code').notNull().unique(), // e.g. 'BTL-EMP-001'
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull().unique(),
    phone: text('phone').notNull(),
    designation: text('designation').notNull(), // e.g. 'Senior CNC Programmer', 'VMC Operator'
    departmentId: uuid('department_id')
        .notNull()
        .references(() => departments.id, { onDelete: 'restrict' }),
    dateOfJoining: date('date_of_joining').notNull(),
    dateOfBirth: date('date_of_birth'),
    status: text('status').default('active').notNull(), // 'active', 'on_leave', 'terminated'
    emergencyContact: text('emergency_contact'),
    bloodGroup: text('blood_group'),
    address: text('address'),
    salary: numeric('salary', { precision: 12, scale: 2 }), // Decimal-safe salary field
    isArchived: boolean('is_archived').default(false).notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const departmentsRelations = relations(departments, ({ one, many }) => ({
    manager: one(users, {
        fields: [departments.managerId],
        references: [users.id],
    }),
    employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
    department: one(departments, {
        fields: [employees.departmentId],
        references: [departments.id],
    }),
    user: one(users, {
        fields: [employees.userId],
        references: [users.id],
    }),
}));

