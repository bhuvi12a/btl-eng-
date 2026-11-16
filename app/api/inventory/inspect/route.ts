import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { qualityInspections, inventoryStock } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        const inspections = await db.query.qualityInspections.findMany({
            where: productId ? eq(qualityInspections.productId, productId) : undefined,
            with: {
                product: true,
                inspectedBy: {
                    columns: { fullName: true, email: true },
                },
            },
            orderBy: [desc(qualityInspections.createdAt)],
            limit: 50,
        });

        // Compute overall rejection rate
        let totalInspected = 0;
        let totalRejected = 0;
        inspections.forEach((i) => {
            totalInspected += parseFloat(i.inspectedQuantity || '0');
            totalRejected += parseFloat(i.rejectedQuantity || '0');
        });

        const overallRejectionPercent = totalInspected > 0 ? ((totalRejected / totalInspected) * 100).toFixed(2) : '0.00';

        return NextResponse.json({
            success: true,
            inspections,
            summary: {
                totalInspected,
                totalRejected,
                overallRejectionPercent: `${overallRejectionPercent}%`,
            },
        });
    } catch (err: any) {
        console.error('Inspection fetch error:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch inspections' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const body = await req.json();
        const { stockId, productId, batchNumber, inspectedQuantity, passedQuantity, rejectedQuantity, rejectionReason } = body;

        const inspected = parseFloat(inspectedQuantity);
        const passed = parseFloat(passedQuantity);
        const rejected = parseFloat(rejectedQuantity || '0');

        if (isNaN(inspected) || isNaN(passed) || inspected <= 0) {
            return NextResponse.json({ success: false, error: 'Valid inspected and passed quantities are required' }, { status: 400 });
        }

        const rejectionPercentage = ((rejected / inspected) * 100).toFixed(2);

        const [created] = await db
            .insert(qualityInspections)
            .values({
                stockId: stockId || null,
                productId,
                batchNumber: batchNumber || null,
                inspectedQuantity: inspected.toFixed(2),
                passedQuantity: passed.toFixed(2),
                rejectedQuantity: rejected.toFixed(2),
                rejectionReason: rejectionReason || null,
                rejectionPercentage,
                inspectedById: user?.id || null,
            })
            .returning();

        return NextResponse.json({
            success: true,
            inspection: created,
            rejectionPercentage: `${rejectionPercentage}%`,
        }, { status: 201 });
    } catch (err: any) {
        console.error('Inspection post error:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to record inspection' }, { status: 500 });
    }
}

