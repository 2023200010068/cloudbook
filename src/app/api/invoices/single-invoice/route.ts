import { NextRequest, NextResponse } from 'next/server';
import { connectionToDatabase } from '@/src/util/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const invoiceId = searchParams.get('id');
        const db = await connectionToDatabase();

        if (!invoiceId) {
            return NextResponse.json(
                { success: false, message: 'Invoice ID is required in headers' },
                { status: 400 }
            );
        }

        const invoices = await db.query(
            `SELECT * FROM invoices WHERE id = $1`,
            [invoiceId]
        );

        if (invoices.rows.length == 0) {
            return NextResponse.json(
                { success: false, message: 'Invoice not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: invoices.rows[0] },
            { status: 200 }
        );
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
