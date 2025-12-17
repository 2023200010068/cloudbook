import { connectionToDatabase } from '@/src/util/db';
import { NextRequest, NextResponse } from 'next/server';

// POST - Create a new invoice
export async function POST(request: NextRequest) {
    try {
        const { user_id, invoice_id, customer, items, invoice_date, due_date, subtotal, tax, discount, total, paid_amount, due_amount, pay_type, sub_invoice, notes } = await request.json();

        if (!user_id || !invoice_id || !customer || !items) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        const result = await db.query(
            `INSERT INTO invoices 
                (user_id, invoice_id, customer, items, invoice_date, due_date, subtotal, tax, discount, total, paid_amount, due_amount, pay_type, sub_invoice, notes)
             VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
             RETURNING id`,
            [user_id, invoice_id, JSON.stringify(customer), JSON.stringify(items), invoice_date, due_date, subtotal, tax, discount, total, paid_amount, due_amount, pay_type, JSON.stringify(sub_invoice), notes]
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Invoice added successfully',
                invoiceId: result.rows[0].id
            },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to add invoice' },
            { status: 500 }
        );
    }
}

// GET - Retrieve invoices
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const db = await connectionToDatabase();

        let invoices;
        if (user_id) {
            const result = await db.query(
                `SELECT * FROM invoices WHERE user_id = $1`,
                [user_id]
            );
            invoices = result.rows;

            if (invoices.length == 0) {
                return NextResponse.json(
                    { success: false, message: "Invoice not found" },
                    { status: 404 }
                );
            }
        } else {
            const result = await db.query(`SELECT * FROM invoices`);
            invoices = result.rows;
        }

        return NextResponse.json(
            { success: true, data: invoices },
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

// PUT - Update an invoice
export async function PUT(request: NextRequest) {
    try {
        const { id, invoice_id, customer, items, invoice_date, due_date, subtotal, tax, discount, total, paid_amount, due_amount, pay_type, sub_invoice, notes } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Invoice ID is required" },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        // Check if invoice exists
        const existingInvoice = await db.query(
            `SELECT * FROM invoices WHERE id = $1`,
            [id]
        );

        if (existingInvoice.rows.length == 0) {
            return NextResponse.json(
                { success: false, message: "Invoice not found" },
                { status: 404 }
            );
        }

        // Update invoice
        await db.query(
            `UPDATE invoices
             SET invoice_id=$1, customer=$2, items=$3, invoice_date=$4, due_date=$5,
                 subtotal=$6, tax=$7, discount=$8, total=$9,
                 paid_amount=$10, due_amount=$11, pay_type=$12, sub_invoice=$13, notes=$14
             WHERE id=$15`,
            [invoice_id, JSON.stringify(customer), JSON.stringify(items), invoice_date, due_date,
             subtotal, tax, discount, total,
             paid_amount, due_amount, pay_type, JSON.stringify(sub_invoice), notes, id]
        );

        return NextResponse.json(
            { success: true, message: 'Invoice updated successfully' },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to update invoice' },
            { status: 500 }
        );
    }
}

// DELETE - Remove an invoice
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Invoice ID is required" },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        const existingInvoice = await db.query(
            `SELECT * FROM invoices WHERE id = $1`,
            [id]
        );

        if (existingInvoice.rows.length == 0) {
            return NextResponse.json(
                { success: false, message: "Invoice not found" },
                { status: 404 }
            );
        }

        await db.query(
            `DELETE FROM invoices WHERE id = $1`,
            [id]
        );

        return NextResponse.json(
            { success: true, message: 'Invoice deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to delete invoice' },
            { status: 500 }
        );
    }
}
