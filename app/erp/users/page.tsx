'use client';

import { useState, useEffect } from 'react';
import { roleHierarchy, formatRoleName, moduleAccessMatrix, type UserRole } from '@/lib/auth/rbac';

interface Employee {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    designation: string;
    departmentId: string;
    department?: { name: string; code: string };
    dateOfJoining: string;
    status: 'active' | 'on_leave' | 'relieved' | 'terminated';
    salary: string | null;
    isSalaryMasked: boolean;
    isArchived: boolean;
    bloodGroup?: string;
    emergencyContact?: string;
}

interface AttendanceRecord {
    id: string;
    employeeName: string;
    employeeCode: string;
    date: string;
    status: 'present' | 'absent' | 'half_day' | 'leave' | 'overtime';
    shift: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    hoursWorked: string;
    overtimeHours: string;
    gpsVerified: boolean;
    correctionReason: string | null;
    isArchived: boolean;
}

interface Department {
    id: string;
    name: string;
    code: string;
}

export default function ErpUsersPage() {
    const [activeTab, setActiveTab] = useState<'rbac' | 'employees' | 'attendance'>('employees');

    // RBAC state
    const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
    const [roleSearchTerm, setRoleSearchTerm] = useState('');

    // Employee state
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [canViewSalary, setCanViewSalary] = useState(false);
    const [showAddEmpModal, setShowAddEmpModal] = useState(false);

    // Form state for new employee
    const [newEmpForm, setNewEmpForm] = useState({
        employeeCode: `BTL-${Math.floor(100 + Math.random() * 900)}`,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: '',
        departmentId: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        salary: '',
        bloodGroup: 'O+',
        emergencyContact: '',
    });

    // Attendance State
    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
    const [attendanceSummary, setAttendanceSummary] = useState({
        total: 0,
        present: 0,
        absent: 0,
        onLeave: 0,
        overtimeHours: '0.0',
        gpsVerifiedCount: 0,
    });
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [canCorrect, setCanCorrect] = useState(true);
    const [correctionModalRecord, setCorrectionModalRecord] = useState<AttendanceRecord | null>(null);
    const [correctionForm, setCorrectionForm] = useState({
        status: 'present',
        checkInTime: '09:00 AM',
        checkOutTime: '06:00 PM',
        hoursWorked: '8.00',
        overtimeHours: '0.00',
        correctionReason: '',
    });

    // Notification message
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4500);
    };

    // Load Employees
    const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        try {
            const url = `/api/employees?include_archived=${showArchived}${filterDept ? `&department_id=${filterDept}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setEmployees(data.employees || []);
                setDepartments(data.departments || []);
                setCanViewSalary(data.userCanViewSalary);
                if (data.departments?.length > 0 && !newEmpForm.departmentId) {
                    setNewEmpForm((prev) => ({ ...prev, departmentId: data.departments[0].id }));
                }
            }
        } catch (err) {
            console.error('Failed to load employees:', err);
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    // Load Attendance
    const fetchAttendance = async () => {
        try {
            const res = await fetch(`/api/attendance?date=${attendanceDate}`);
            const data = await res.json();
            if (data.success) {
                setAttendanceList(data.records || []);
                setAttendanceSummary(data.summary || { total: 0, present: 0, absent: 0, onLeave: 0, overtimeHours: '0.0', gpsVerifiedCount: 0 });
                setCanCorrect(data.canCorrect);
            }
        } catch (err) {
            console.error('Failed to load attendance:', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'employees') {
            fetchEmployees();
        } else if (activeTab === 'attendance') {
            fetchAttendance();
        }
    }, [activeTab, showArchived, filterDept, attendanceDate]);

    // Handle Create Employee
    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmpForm),
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Employee ${data.employee.employeeCode} registered successfully.`);
                setShowAddEmpModal(false);
                fetchEmployees();
                setNewEmpForm({
                    employeeCode: `BTL-${Math.floor(100 + Math.random() * 900)}`,
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    designation: '',
                    departmentId: departments[0]?.id || '',
                    dateOfJoining: new Date().toISOString().split('T')[0],
                    salary: '',
                    bloodGroup: 'O+',
                    emergencyContact: '',
                });
            } else {
                showToast(data.error || 'Failed to register employee', 'error');
            }
        } catch {
            showToast('Network error while registering employee', 'error');
        }
    };

    // Handle Archive / Retain Employee
    const handleToggleArchive = async (emp: Employee) => {
        const action = emp.isArchived ? 'restore' : 'archive';
        const confirmed = window.confirm(
            emp.isArchived
                ? `Restore ${emp.firstName} ${emp.lastName} to active employment records?`
                : `Archive ${emp.firstName} ${emp.lastName}? (Record will be retained legally without permanent deletion)`
        );
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/employees/${emp.id}/archive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isArchived: !emp.isArchived,
                    status: !emp.isArchived ? 'relieved' : 'active',
                    reason: `Manual administrative ${action}`,
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message);
                fetchEmployees();
            } else {
                showToast(data.error || 'Failed to update employee status', 'error');
            }
        } catch {
            showToast('Network error while updating employee status', 'error');
        }
    };

    // Open Admin Correction Modal
    const handleOpenCorrection = (record: AttendanceRecord) => {
        setCorrectionModalRecord(record);
        setCorrectionForm({
            status: record.status,
            checkInTime: record.checkInTime || '09:00 AM',
            checkOutTime: record.checkOutTime || '06:00 PM',
            hoursWorked: record.hoursWorked || '8.00',
            overtimeHours: record.overtimeHours || '0.00',
            correctionReason: '',
        });
    };

    // Submit Attendance Correction
    const handleSubmitCorrection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!correctionModalRecord) return;

        if (!correctionForm.correctionReason || correctionForm.correctionReason.trim().length < 5) {
            showToast('Mandatory correction reason (minimum 5 characters) required.', 'error');
            return;
        }

        try {
            const res = await fetch('/api/attendance/correct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recordId: correctionModalRecord.id,
                    status: correctionForm.status,
                    checkInTime: correctionForm.checkInTime,
                    checkOutTime: correctionForm.checkOutTime,
                    hoursWorked: correctionForm.hoursWorked,
                    overtimeHours: correctionForm.overtimeHours,
                    correctionReason: correctionForm.correctionReason,
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Attendance corrected for ${data.record.employeeName}. Audit log recorded.`);
                setCorrectionModalRecord(null);
                fetchAttendance();
            } else {
                showToast(data.error || 'Correction failed', 'error');
            }
        } catch {
            showToast('Network error while applying correction', 'error');
        }
    };

    const rolesList = Object.keys(roleHierarchy) as UserRole[];
    const modules = Object.keys(moduleAccessMatrix);
    const filteredModules = modules.filter((m) =>
        m.toLowerCase().includes(roleSearchTerm.toLowerCase())
    );

    const filteredEmployees = employees.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.employeeCode} ${e.designation} ${e.email}`
            .toLowerCase()
            .includes(employeeSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toastMessage && (
                <div
                    className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                        toastMessage.type === 'error'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                >
                    <span>{toastMessage.type === 'error' ? '⚠️' : '✅'}</span>
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* Header */}
            <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>👥</span>
                        <span>User Roles, Employee Directory & Attendance</span>
                    </h1>
                    <p className="text-slate-500 text-xs mt-1">
                        Enterprise personnel database, GPS self-attendance, admin correction audits, and RBAC matrix
                    </p>
                </div>

                {/* Sub-Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200 self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`px-3.5 py-1.5 rounded-lg transition-all ${
                            activeTab === 'employees'
                                ? 'bg-white text-blue-700 shadow-sm font-semibold'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        👨‍🔧 Employee Records ({employees.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-3.5 py-1.5 rounded-lg transition-all ${
                            activeTab === 'attendance'
                                ? 'bg-white text-blue-700 shadow-sm font-semibold'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        ⏱️ Attendance & Corrections
                    </button>
                    <button
                        onClick={() => setActiveTab('rbac')}
                        className={`px-3.5 py-1.5 rounded-lg transition-all ${
                            activeTab === 'rbac'
                                ? 'bg-white text-blue-700 shadow-sm font-semibold'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        🔐 Access Matrix (RBAC)
                    </button>
                </div>
            </div>

            {/* TAB 1: EMPLOYEE DIRECTORY & PERMANENT SERVICE HISTORY */}
            {activeTab === 'employees' && (
                <div className="space-y-4">
                    {/* Toolbar */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search by name, code, designation, email..."
                                value={employeeSearch}
                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 w-full sm:w-72 focus:outline-none focus:border-blue-600"
                            />
                            <select
                                value={filterDept}
                                onChange={(e) => setFilterDept(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                            >
                                <option value="">All Departments</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} ({d.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={showArchived}
                                    onChange={(e) => setShowArchived(e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Show Archived / Relieved</span>
                            </label>
                            <button
                                onClick={() => setShowAddEmpModal(true)}
                                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                            >
                                <span>+</span>
                                <span>Register Employee</span>
                            </button>
                        </div>
                    </div>

                    {/* Employee Directory Table */}
                    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                        <th className="py-3 px-4">Emp Code</th>
                                        <th className="py-3 px-4">Full Name</th>
                                        <th className="py-3 px-4">Designation & Dept</th>
                                        <th className="py-3 px-4">Contact</th>
                                        <th className="py-3 px-4">Joining Date</th>
                                        <th className="py-3 px-4">Salary History</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoadingEmployees ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-slate-400">
                                                Loading employee records from Supabase...
                                            </td>
                                        </tr>
                                    ) : filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-slate-400">
                                                No employees found matching the current search criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployees.map((emp) => (
                                            <tr
                                                key={emp.id}
                                                className={`hover:bg-slate-50/60 transition-colors ${
                                                    emp.isArchived ? 'bg-slate-50/40 text-slate-400' : ''
                                                }`}
                                            >
                                                <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                                                    {emp.employeeCode}
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-slate-900">
                                                    <div>{emp.firstName} {emp.lastName}</div>
                                                    {emp.bloodGroup && (
                                                        <span className="text-[10px] text-slate-400">Blood: {emp.bloodGroup}</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="text-slate-800 font-medium">{emp.designation}</div>
                                                    <div className="text-[11px] text-slate-400">
                                                        {emp.department?.name || 'Department Assigned'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600">
                                                    <div>{emp.phone}</div>
                                                    <div className="text-[11px] text-slate-400">{emp.email}</div>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 font-mono">
                                                    {emp.dateOfJoining}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {canViewSalary ? (
                                                        <span className="font-mono font-semibold text-slate-900">
                                                            {emp.salary ? `₹${parseFloat(emp.salary).toLocaleString('en-IN')}` : '₹—'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[11px]">
                                                            🔒 Confidential
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {emp.isArchived ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                                                            Archived / Relieved
                                                        </span>
                                                    ) : emp.status === 'active' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            {emp.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        onClick={() => handleToggleArchive(emp)}
                                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                                                            emp.isArchived
                                                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                                        }`}
                                                        title="Soft archive or restore without permanent database deletion"
                                                    >
                                                        {emp.isArchived ? 'Restore' : 'Archive'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ATTENDANCE MANAGEMENT & ADMIN CORRECTIONS */}
            {activeTab === 'attendance' && (
                <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                            <span className="text-[11px] font-semibold uppercase text-slate-400 block">Total Logs</span>
                            <span className="text-xl font-bold text-slate-900">{attendanceSummary.total}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
                            <span className="text-[11px] font-semibold uppercase text-emerald-700 block">Present</span>
                            <span className="text-xl font-bold text-emerald-800">{attendanceSummary.present}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-sm">
                            <span className="text-[11px] font-semibold uppercase text-rose-700 block">Absent</span>
                            <span className="text-xl font-bold text-rose-800">{attendanceSummary.absent}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm">
                            <span className="text-[11px] font-semibold uppercase text-amber-700 block">On Leave</span>
                            <span className="text-xl font-bold text-amber-800">{attendanceSummary.onLeave}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-sm">
                            <span className="text-[11px] font-semibold uppercase text-blue-700 block">Overtime Hrs</span>
                            <span className="text-xl font-bold text-blue-800">{attendanceSummary.overtimeHours} h</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-sm">
                            <span className="text-[11px] font-semibold uppercase text-indigo-700 block">GPS Verified</span>
                            <span className="text-xl font-bold text-indigo-800">{attendanceSummary.gpsVerifiedCount}</span>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-700">Attendance Date:</span>
                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                            />
                        </div>
                        <div className="text-xs text-slate-500">
                            📍 Geofence target: Hosur Plant (SIPCOT Phase 1) • Radius: 500m
                        </div>
                    </div>

                    {/* Attendance Table */}
                    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                        <th className="py-3 px-4">Employee</th>
                                        <th className="py-3 px-4">Date & Shift</th>
                                        <th className="py-3 px-4">Punch In</th>
                                        <th className="py-3 px-4">Punch Out</th>
                                        <th className="py-3 px-4">Hours</th>
                                        <th className="py-3 px-4">GPS Verification</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Audit Note</th>
                                        <th className="py-3 px-4 text-right">Correction</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {attendanceList.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-center text-slate-400">
                                                No attendance punches recorded for {attendanceDate}.
                                            </td>
                                        </tr>
                                    ) : (
                                        attendanceList.map((att) => (
                                            <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-3.5 px-4 font-semibold text-slate-900">
                                                    <div>{att.employeeName}</div>
                                                    <span className="text-[11px] font-mono text-blue-700">{att.employeeCode}</span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600">
                                                    <div>{att.date}</div>
                                                    <span className="text-[11px] text-slate-400 uppercase">{att.shift}</span>
                                                </td>
                                                <td className="py-3.5 px-4 font-mono text-slate-800">{att.checkInTime || '—'}</td>
                                                <td className="py-3.5 px-4 font-mono text-slate-800">{att.checkOutTime || '—'}</td>
                                                <td className="py-3.5 px-4 font-mono">
                                                    <span className="text-slate-800">{att.hoursWorked}h</span>
                                                    {parseFloat(att.overtimeHours) > 0 && (
                                                        <span className="text-blue-600 text-[10px] block font-semibold">
                                                            +{att.overtimeHours}h OT
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {att.gpsVerified ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span>📍</span> Verified Geofence
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                            Manual / Remote
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                                            att.status === 'present'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : att.status === 'absent'
                                                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        }`}
                                                    >
                                                        {att.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-[11px] text-slate-500 max-w-xs truncate">
                                                    {att.correctionReason ? (
                                                        <span className="text-amber-700 font-medium" title={att.correctionReason}>
                                                            ✏️ {att.correctionReason}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    {canCorrect ? (
                                                        <button
                                                            onClick={() => handleOpenCorrection(att)}
                                                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                                                        >
                                                            Admin Correct
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400 text-[10px] italic">Read-only</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: ROLE-BASED ACCESS CONTROL MATRIX */}
            {activeTab === 'rbac' && (
                <div className="space-y-6">
                    {/* Role Selector Cards */}
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3">
                            Select Role to Inspect Authorization Scope
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {rolesList.map((r) => {
                                const isSelected = selectedRole === r;
                                return (
                                    <button
                                        key={r}
                                        onClick={() => setSelectedRole(r)}
                                        className={`p-4 rounded-2xl text-left border transition-all ${
                                            isSelected
                                                ? 'bg-blue-50 border-blue-600 shadow-sm'
                                                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span
                                                className={`text-xs font-bold block ${
                                                    isSelected ? 'text-blue-700' : 'text-slate-900'
                                                }`}
                                            >
                                                {formatRoleName(r)}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-slate-500 font-mono">
                                            Rank: {roleHierarchy[r]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Permissions Matrix */}
                    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Authorized Modules for {formatRoleName(selectedRole)}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Rank: {roleHierarchy[selectedRole]} / 100 • Enforced at Supabase server route handlers
                                </p>
                            </div>
                            <input
                                type="text"
                                placeholder="Filter module name..."
                                value={roleSearchTerm}
                                onChange={(e) => setRoleSearchTerm(e.target.value)}
                                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredModules.map((mod) => {
                                const hasAccess =
                                    selectedRole === 'super_admin' ||
                                    moduleAccessMatrix[mod]?.includes(selectedRole);

                                return (
                                    <div
                                        key={mod}
                                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                                            hasAccess
                                                ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                                                : 'bg-slate-50/50 border-slate-200 text-slate-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{mod}</span>
                                        </div>
                                        <span
                                            className={`font-semibold ${
                                                hasAccess ? 'text-emerald-700' : 'text-slate-400'
                                            }`}
                                        >
                                            {hasAccess ? '✓ Authorized' : '✕ Denied'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Register Permanent Employee */}
            {showAddEmpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>👨‍🔧</span>
                                <span>Register Permanent Employee</span>
                            </h3>
                            <button
                                onClick={() => setShowAddEmpModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateEmployee} className="mt-4 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Employee Code *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEmpForm.employeeCode}
                                        onChange={(e) => setNewEmpForm({ ...newEmpForm, employeeCode: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                                    <select
                                        required
                                        value={newEmpForm.departmentId}
                                        onChange={(e) => setNewEmpForm({ ...newEmpForm, departmentId: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    >
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} ({d.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEmpForm.firstName}
                                        onChange={(e) => setNewEmpForm({ ...newEmpForm, firstName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEmpForm.lastName}
                                        onChange={(e) => setNewEmpForm({ ...newEmpForm, lastName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Official Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={newEmpForm.email}
                                        onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newEmpForm.phone}
                                        onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Designation *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. CNC VMC Programmer"
                                        value={newEmpForm.designation}
                                        onChange={(e) => setNewEmpForm({ ...newEmpForm, designation: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Date of Joining *</label>
                                    <input
                                        type="date"
                                        required
                                        value={newEmpForm.dateOfJoining}
                                        onChange={(e) => setNewEmpForm({ ...newEmpForm, dateOfJoining: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Monthly Salary (INR)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 45000"
                                        value={newEmpForm.salary}
                                        onChange={(e) => setNewEmpForm({ ...newEmpForm, salary: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Blood Group</label>
                                    <select
                                        value={newEmpForm.bloodGroup}
                                        onChange={(e) => setNewEmpForm({ ...newEmpForm, bloodGroup: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddEmpModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                                >
                                    Register & Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Admin Attendance Correction */}
            {correctionModalRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span>✏️</span>
                                    <span>Admin Attendance Correction</span>
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    {correctionModalRecord.employeeName} ({correctionModalRecord.employeeCode}) • {correctionModalRecord.date}
                                </p>
                            </div>
                            <button
                                onClick={() => setCorrectionModalRecord(null)}
                                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCorrection} className="mt-4 space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                                <select
                                    value={correctionForm.status}
                                    onChange={(e) => setCorrectionForm({ ...correctionForm, status: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="half_day">Half Day</option>
                                    <option value="leave">On Leave</option>
                                    <option value="overtime">Overtime Shift</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Punch In Time</label>
                                    <input
                                        type="text"
                                        placeholder="09:00 AM"
                                        value={correctionForm.checkInTime}
                                        onChange={(e) => setCorrectionForm({ ...correctionForm, checkInTime: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Punch Out Time</label>
                                    <input
                                        type="text"
                                        placeholder="06:00 PM"
                                        value={correctionForm.checkOutTime}
                                        onChange={(e) => setCorrectionForm({ ...correctionForm, checkOutTime: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Hours Worked</label>
                                    <input
                                        type="text"
                                        value={correctionForm.hoursWorked}
                                        onChange={(e) => setCorrectionForm({ ...correctionForm, hoursWorked: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Overtime Hours</label>
                                    <input
                                        type="text"
                                        value={correctionForm.overtimeHours}
                                        onChange={(e) => setCorrectionForm({ ...correctionForm, overtimeHours: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">
                                    Mandatory Reason for Correction *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Explain why this attendance record is being modified (recorded immutably in Audit Logs)..."
                                    value={correctionForm.correctionReason}
                                    onChange={(e) => setCorrectionForm({ ...correctionForm, correctionReason: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                />
                                <span className="text-[10px] text-slate-400">
                                    Minimum 5 characters. Stored permanently in system audit trail.
                                </span>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCorrectionModalRecord(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                                >
                                    Apply Correction & Audit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
