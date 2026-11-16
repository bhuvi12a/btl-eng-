import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { billOfMaterials, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const bomItems = await db.query.billOfMaterials.findMany({
            where: eq(billOfMaterials.parentProductId, id),
            with: {
                rawMaterial: true,
            },
        });

        // Compute Production Cost Breakdown
        let rawMaterialTotal = 0;
        let toolingTotal = 0;
        let totalMachiningMinutes = 0;
        const MACHINE_HOURLY_RATE = 450; // ₹450 / hour for 4th-axis VMC milling & CNC turning

        bomItems.forEach((b) => {
            const rawCost = parseFloat(b.rawMaterial?.standardCost || '0');
            const qtyReq = parseFloat(b.quantityRequired || '1');
            const scrapFactor = 1 + parseFloat(b.scrapAllowancePercent || '5') / 100;
            rawMaterialTotal += rawCost * qtyReq * scrapFactor;

            toolingTotal += parseFloat(b.toolingCostPerUnit || '0');
            totalMachiningMinutes += parseFloat(b.machiningTimeMinutes || '0');
        });

        const machineLaborCost = (totalMachiningMinutes / 60) * MACHINE_HOURLY_RATE;
        const totalNetManufacturingCost = rawMaterialTotal + toolingTotal + machineLaborCost;

        return NextResponse.json({
            success: true,
            bomItems,
            costingBreakdown: {
                rawMaterialTotal: rawMaterialTotal.toFixed(2),
                toolingTotal: toolingTotal.toFixed(2),
                totalMachiningMinutes,
                machineLaborCost: machineLaborCost.toFixed(2),
                totalNetManufacturingCost: totalNetManufacturingCost.toFixed(2),
            },
        });
    } catch (err: any) {
        console.error('BOM fetch error:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch BOM' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const { rawMaterialProductId, quantityRequired, scrapAllowancePercent, machiningTimeMinutes, toolingCostPerUnit } = body;

        if (!rawMaterialProductId || !quantityRequired) {
            return NextResponse.json({ success: false, error: 'Raw material and quantity required' }, { status: 400 });
        }

        const [created] = await db
            .insert(billOfMaterials)
            .values({
                parentProductId: id,
                rawMaterialProductId,
                quantityRequired: quantityRequired.toString(),
                scrapAllowancePercent: scrapAllowancePercent ? scrapAllowancePercent.toString() : '5.00',
                machiningTimeMinutes: machiningTimeMinutes ? machiningTimeMinutes.toString() : '10.00',
                toolingCostPerUnit: toolingCostPerUnit ? toolingCostPerUnit.toString() : '0.00',
            })
            .returning();

        return NextResponse.json({ success: true, item: created }, { status: 201 });
    } catch (err: any) {
        console.error('BOM create error:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Failed to create BOM record' }, { status: 500 });
    }
}

