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
    employee: 10,
};

// ERP Module access matrix - Maintained strictly for Admin & Manager
// Employees have NO access to any ERP module.
export const moduleAccessMatrix: Record<string, UserRole[]> = {
    // Admin Only Modules
    admin_settings: ['super_admin', 'admin'],
    audit_logs: ['super_admin', 'admin'],
    user_management: ['super_admin', 'admin'],
    tally_integration: ['super_admin', 'admin'],
    payroll: ['super_admin', 'admin'],

    // Modules shared with Manager
    dashboard: ['super_admin', 'admin', 'manager'],
    attendance: ['super_admin', 'admin', 'manager'],
    employees: ['super_admin', 'admin', 'manager'],
    customers: ['super_admin', 'admin', 'manager'],
    sales: ['super_admin', 'admin', 'manager'],
    suppliers: ['super_admin', 'admin', 'manager'],
    purchases: ['super_admin', 'admin', 'manager'],
    products: ['super_admin', 'admin', 'manager'],
    inventory: ['super_admin', 'admin', 'manager'],
    warehouses: ['super_admin', 'admin', 'manager'],
    invoices: ['super_admin', 'admin', 'manager'],
};

/**
 * Checks if a given role has access to a target module.
 * Employees never have access to ERP modules.
 */
export function hasModuleAccess(role: UserRole, module: string): boolean {
    if (role === 'employee') return false;
    if (role === 'super_admin' || role === 'admin') return true;
    const allowedRoles = moduleAccessMatrix[module];
    if (!allowedRoles) return false;
    return allowedRoles.includes(role);
}

/**
 * Checks if a role is permitted to enter the ERP dashboard area (/erp/*).
 * Only Admin and Manager are allowed.
 */
export function canAccessErp(role: UserRole): boolean {
    return ['super_admin', 'admin', 'manager'].includes(role);
}

/**
 * Formats a role slug into a human-readable display string.
 */
export function formatRoleName(role: UserRole): string {
    const map: Record<UserRole, string> = {
        super_admin: 'Super Admin',
        admin: 'Admin',
        manager: 'Manager',
        employee: 'Employee',
        engineer: 'Engineer (Legacy)',
        production_staff: 'Staff (Legacy)',
        store_manager: 'Store Manager (Legacy)',
        accountant: 'Accountant (Legacy)',
        quality_inspector: 'Inspector (Legacy)',
        hr: 'HR (Legacy)',
    };
    return map[role] || role;
}
