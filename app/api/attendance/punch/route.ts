import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendance, auditLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { desc, eq, and } from 'drizzle-orm';

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
        const user = await getCurrentUser();
        const body = await req.json();
        const { employeeName, employeeCode, latitude, longitude, punchType } = body;

        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];
        const currentTimeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Calculate GPS distance from Hosur Plant
        let gpsVerified = false;
        let distanceMeters = null;

        if (latitude && longitude) {
            distanceMeters = getDistanceMeters(
                parseFloat(latitude),
                parseFloat(longitude),
                HOSUR_PLANT_LAT,
                HOSUR_PLANT_LNG
            );
            gpsVerified = distanceMeters <= MAX_ALLOWED_DISTANCE_METERS;
        }

        // Determine Shift automatically based on punch hour
        const hour = now.getHours();
        let autoShift: 'general' | 'shift_1' | 'shift_2' | 'night' = 'general';
        if (hour >= 6 && hour < 14) autoShift = 'shift_1';
        else if (hour >= 14 && hour < 22) autoShift = 'shift_2';
        else if (hour >= 22 || hour < 6) autoShift = 'night';

        // Check if attendance record already exists for today
        const existing = await db.query.attendance.findFirst({
            where: and(
                eq(attendance.employeeCode, employeeCode),
                eq(attendance.date, todayDate)
            ),
        });

        if (existing) {
            // Punch Out update
            const [updated] = await db
                .update(attendance)
                .set({
                    checkOutTime: currentTimeString,
                    latitude: latitude ? latitude.toString() : existing.latitude,
                    longitude: longitude ? longitude.toString() : existing.longitude,
                })
                .where(eq(attendance.id, existing.id))
                .returning();

            return NextResponse.json({
                success: true,
                message: `Punched Out at ${currentTimeString}`,
                record: updated,
                gpsVerified,
                distanceMeters: distanceMeters ? Math.round(distanceMeters) : null,
            });
        }

        // New Punch In
        const [created] = await db
            .insert(attendance)
            .values({
                userId: user?.id || null,
                employeeName: employeeName || (user ? user.fullName : 'CNC Operator'),
                employeeCode: employeeCode || 'BTL-EMP-01',
                date: todayDate,
                status: 'present',
                shift: autoShift,
                checkInTime: currentTimeString,
                hoursWorked: '8.00',
                overtimeHours: '0.00',
                latitude: latitude ? latitude.toString() : null,
                longitude: longitude ? longitude.toString() : null,
                gpsVerified,
                notes: gpsVerified
                    ? 'GPS verified within Hosur plant premises'
                    : `Outside plant radius (~${distanceMeters ? Math.round(distanceMeters) : 'Unknown'}m)`,
            })
            .returning();

        return NextResponse.json({
            success: true,
            message: `Punched In at ${currentTimeString} (Shift: ${autoShift.toUpperCase()})`,
            record: created,
            gpsVerified,
            distanceMeters: distanceMeters ? Math.round(distanceMeters) : null,
        }, { status: 201 });
    } catch (err: any) {
        console.error('GPS punch error:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to record punch' }, { status: 500 });
    }
}

