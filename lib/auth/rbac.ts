import { type userRoleEnumValues } from '../validations/auth';

export type UserRole = (typeof userRoleEnumValues)[number];

// Role hierarchy rank (higher number = more privileges)
export const roleHierarchy: Record<UserRole, number> = {
    super_admin: 100,
    admin: 90,
    manager: 80,
    hr: 70,
    accountant: 70,
    store_manager: 60,
    quality_inspector: 60,
    engineer: 60,
    production_staff: 40,
};

// Module access matrix by role
export const moduleAccessMatrix: Record<string, UserRole[]> = {
    // Admin & System
    dashboard: ['super_admin', 'admin', 'manager', 'hr', 'accountant', 'store_manager', 'quality_inspector', 'engineer', 'production_staff'],
    admin_settings: ['super_admin', 'admin'],
    audit_logs: ['super_admin', 'admin'],
    user_management: ['super_admin', 'admin', 'hr'],

    // HR & Employees
    employees: ['super_admin', 'admin', 'manager', 'hr'],
    payroll: ['super_admin', 'admin', 'accountant', 'hr'],
    attendance: ['super_admin', 'admin', 'hr', 'manager'],

    // CRM & Sales
    customers: ['super_admin', 'admin', 'manager', 'accountant'],
    suppliers: ['super_admin', 'admin', 'manager', 'store_manager'],
    sales: ['super_admin', 'admin', 'manager', 'accountant'],

    // Inventory & Procurement
    products: ['super_admin', 'admin', 'manager', 'store_manager'],
    inventory: ['super_admin', 'admin', 'manager', 'store_manager', 'production_staff'],
    warehouses: ['super_admin', 'admin', 'manager', 'store_manager'],
    purchases: ['super_admin', 'admin', 'manager', 'store_manager', 'accountant'],
    invoices: ['super_admin', 'admin', 'accountant'],

    // External Integration
    tally_integration: ['super_admin', 'admin'],
};

/**
 * Checks if a given role has access to a target module.
 */
export function hasModuleAccess(role: UserRole, module: string): boolean {
    if (role === 'super_admin') return true;
    const allowedRoles = moduleAccessMatrix[module];
    if (!allowedRoles) return false;
    return allowedRoles.includes(role);
}

/**
 * Formats a role slug into a human-readable display string.
 */
export function formatRoleName(role: UserRole): string {
    const map: Record<UserRole, string> = {
        super_admin: 'Super Admin',
        admin: 'Admin',
        manager: 'Manager',
        engineer: 'Engineer',
        production_staff: 'Production Staff',
        store_manager: 'Store Manager',
        accountant: 'Accountant',
        quality_inspector: 'Quality Inspector',
        hr: 'HR Manager',
    };
    return map[role] || role;
}

