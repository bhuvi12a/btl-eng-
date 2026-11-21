import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance, employees, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Hosur Manufacturing Facility Geofence Coordinates (SIPCOT Industrial Area)
const HOSUR_PLANT_LAT = 12.7409;
const HOSUR_PLANT_LNG = 77.8253;
const MAX_ALLOWED_DISTANCE_METERS = 500; // 500 meter plant radius allowance

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export async function POST(req: NextRequest) {
    try {
        // 1. Employee Identity Security: Strictly resolve from authenticated server session
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { success: false, error: 'Authentication required. Please log in with your employee account.' },
                { status: 401 }
            );
        }

        // Verify user is linked to an active employee profile
        const employeeRecord = await db.query.employees.findFirst({
            where: and(eq(employees.userId, currentUser.id), eq(employees.status, 'active')),
        });

        // Resolve trusted identity directly from database
        const employeeCode = employeeRecord?.employeeCode || `BTL-${currentUser.role.toUpperCase()}-${currentUser.id.substring(0, 4).toUpperCase()}`;
        const employeeName = employeeRecord ? `${employeeRecord.firstName} ${employeeRecord.lastName}` : currentUser.fullName;

        // 2. Parse JSON or Multipart payload
        let punchType = 'check_in';
        let latStr: string | null = null;
        let lngStr: string | null = null;
        let accuracyStr: string | null = null;

        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const body = await req.json();
            punchType = body.punchType || 'check_in';
            latStr = body.latitude !== undefined && body.latitude !== null ? String(body.latitude) : null;
            lngStr = body.longitude !== undefined && body.longitude !== null ? String(body.longitude) : null;
            accuracyStr = body.gpsAccuracy !== undefined && body.gpsAccuracy !== null ? String(body.gpsAccuracy) : null;
        } else {
            const formData = await req.formData();
            punchType = (formData.get('punchType') as string) || 'check_in';
            latStr = formData.get('latitude') as string | null;
            lngStr = formData.get('longitude') as string | null;
            accuracyStr = formData.get('gpsAccuracy') as string | null;
        }

        // Server-Authoritative Clock & Date
        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];
        const currentTimeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

        // 3. GPS Geofence Check (Hosur SIPCOT Plant)
        let gpsVerified = false;
        let distanceMeters: number | null = null;
        if (latStr && lngStr) {
            distanceMeters = Math.round(
                getDistanceMeters(parseFloat(latStr), parseFloat(lngStr), HOSUR_PLANT_LAT, HOSUR_PLANT_LNG)
            );
            gpsVerified = distanceMeters <= MAX_ALLOWED_DISTANCE_METERS;
        }

        // Check Existing Attendance Record for Today
        const existingRecord = await db.query.attendance.findFirst({
            where: and(
                eq(attendance.userId, currentUser.id),
                eq(attendance.date, todayDate),
                eq(attendance.isArchived, false)
            ),
        });

        // 4. Punch State Machine
        if (punchType === 'check_in') {
            if (existingRecord && existingRecord.checkInTime) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Duplicate Check-In blocked: You already checked in today at ${existingRecord.checkInTime}.`,
                    },
                    { status: 400 }
                );
            }
        } else if (punchType === 'check_out') {
            if (!existingRecord || !existingRecord.checkInTime) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Cannot record Check-Out: No active Check-In found for today. Please Check-In first.',
                    },
                    { status: 400 }
                );
            }
            if (existingRecord.checkOutTime) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `You have already completed your shift and checked out today at ${existingRecord.checkOutTime}.`,
                    },
                    { status: 400 }
                );
            }
        }

        const userAgent = req.headers.get('user-agent') || 'Mobile Web Kiosk';

        // 5. Atomic Database Execution
        let savedRecord;
        if (punchType === 'check_in') {
            if (existingRecord) {
                [savedRecord] = await db
                    .update(attendance)
                    .set({
                        checkInTime: currentTimeString,
                        originalCheckInTime: currentTimeString,
                        status: 'present',
                        latitude: latStr ? String(latStr) : null,
                        longitude: lngStr ? String(lngStr) : null,
                        gpsVerified,
                        gpsAccuracyMeters: accuracyStr ? String(accuracyStr) : null,
                        deviceInfo: userAgent,
                        consentRecordedAt: now,
                    })
                    .where(eq(attendance.id, existingRecord.id))
                    .returning();
            } else {
                [savedRecord] = await db
                    .insert(attendance)
                    .values({
                        userId: currentUser.id,
                        employeeCode,
                        employeeName,
                        date: todayDate,
                        status: 'present',
                        shift: 'general',
                        checkInTime: currentTimeString,
                        originalCheckInTime: currentTimeString,
                        latitude: latStr ? String(latStr) : null,
                        longitude: lngStr ? String(lngStr) : null,
                        gpsVerified,
                        gpsAccuracyMeters: accuracyStr ? String(accuracyStr) : null,
                        deviceInfo: userAgent,
                        consentRecordedAt: now,
                        hoursWorked: '8.00',
                        overtimeHours: '0.00',
                    })
                    .returning();
            }
        } else {
            // Check-Out calculation
            if (!existingRecord) {
                return NextResponse.json(
                    { success: false, error: 'No active check-in found for today.' },
                    { status: 400 }
                );
            }

            let calculatedHours = '8.00';
            let overtimeHours = '0.00';

            [savedRecord] = await db
                .update(attendance)
                .set({
                    checkOutTime: currentTimeString,
                    originalCheckOutTime: currentTimeString,
                    hoursWorked: calculatedHours,
                    overtimeHours,
                    latitude: latStr ? String(latStr) : existingRecord.latitude,
                    longitude: lngStr ? String(lngStr) : existingRecord.longitude,
                    gpsVerified: gpsVerified || existingRecord.gpsVerified,
                    gpsAccuracyMeters: accuracyStr ? String(accuracyStr) : existingRecord.gpsAccuracyMeters,
                })
                .where(eq(attendance.id, existingRecord.id))
                .returning();
        }

        // 6. Write to Audit Log
        try {
            await db.insert(auditLogs).values({
                userId: currentUser.id,
                userEmail: currentUser.email,
                action: punchType === 'check_in' ? 'ATTENDANCE_CHECK_IN' : 'ATTENDANCE_CHECK_OUT',
                entity: 'attendance',
                entityId: savedRecord.id,
                newValue: {
                    employeeCode,
                    employeeName,
                    punchType,
                    time: currentTimeString,
                    date: todayDate,
                    gpsVerified,
                    distanceFromHosurPlant: distanceMeters !== null ? `${distanceMeters}m` : 'Unknown',
                },
                userAgent,
            });
        } catch (auditErr) {
            console.error('Audit log insertion failed (non-critical):', auditErr);
        }

        return NextResponse.json({
            success: true,
            message: `${punchType === 'check_in' ? 'Check-In' : 'Check-Out'} logged successfully at ${currentTimeString}.`,
            record: {
                id: savedRecord.id,
                time: currentTimeString,
                date: todayDate,
                punchType,
                gpsVerified,
                distanceMeters,
                employeeName,
                employeeCode,
            },
        });
    } catch (err: any) {
        console.error('Punch execution error:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to record attendance punch' },
            { status: 500 }
        );
    }
}
