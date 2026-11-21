import { pgTable, text, timestamp, boolean, uuid, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { departments } from './hr';

// User Role Enum for strict RBAC
export const userRoleEnum = pgEnum('user_role', [
    'super_admin',
    'admin',
    'manager',
    'employee',
    'engineer',
    'production_staff',
    'store_manager',
    'accountant',
    'quality_inspector',
    'hr',
]);

// Roles table (for extensible role metadata)
export const roles = pgTable('roles', {
    id: text('id').primaryKey(), // e.g. 'admin', 'engineer'
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Permissions table (granular capability definition)
export const permissions = pgTable('permissions', {
    id: text('id').primaryKey(), // e.g. 'inventory:read', 'production:write'
    module: text('module').notNull(), // 'inventory', 'production', 'crm', etc.
    action: text('action').notNull(), // 'read', 'write', 'delete', 'approve'
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Role-to-Permissions junction table
export const rolePermissions = pgTable(
    'role_permissions',
    {
        roleId: text('role_id')
            .notNull()
            .references(() => roles.id, { onDelete: 'cascade' }),
        permissionId: text('permission_id')
            .notNull()
            .references(() => permissions.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.roleId, table.permissionId] }),
    ]
);

// Users table (mirrored/linked with Supabase Auth auth.users.id)
export const users = pgTable('users', {
    id: uuid('id').primaryKey(), // Matches Supabase auth.users(id)
    email: text('email').notNull().unique(),
    fullName: text('full_name').notNull(),
    phone: text('phone'),
    role: userRoleEnum('role').default('production_staff').notNull(),
    departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').default(true).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User Session audit / tracking
export const userSessions = pgTable('user_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
    department: one(departments, {
        fields: [users.departmentId],
        references: [departments.id],
    }),
    sessions: many(userSessions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
    permissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
    role: one(roles, {
        fields: [rolePermissions.roleId],
        references: [roles.id],
    }),
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id],
    }),
}));

