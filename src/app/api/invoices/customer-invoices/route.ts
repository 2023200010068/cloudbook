import { connectionToDatabase } from '@/src/util/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Retrieve invoices
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customer_id = searchParams.get('id');
        const db = await connectionToDatabase();

        // If customer ID is provided, fetch invoices for that customer
        if (customer_id) {
            const invoices = await db.query(
                `SELECT * FROM invoices WHERE (customer->>'id')::int = $1`,
                [Number(customer_id)]
            );

            if (invoices.rows.length == 0) {
                return NextResponse.json(
                    { success: false, message: "No invoices found for this customer" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: invoices.rows },
                { status: 200 }
            );
        }

        // If no parameters provided, return all invoices (consider adding pagination)
        const invoices = await db.query(`SELECT * FROM invoices`);

        return NextResponse.json(
            { success: true, data: invoices.rows },
            { status: 200 }
        );
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
