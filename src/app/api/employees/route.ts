import { connectionToDatabase } from '@/src/util/db';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { QueryResult } from 'pg';

export async function POST(request: NextRequest) {
    try {
        const { user_id, employee_id, name, email, contact, department, role, status, password } = await request.json();

        if (!user_id || !employee_id || !name || !email || !contact || !department || !role || !status || !password) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        // Check if email already exists
        const existing: QueryResult = await db.query(
            `SELECT id FROM employees WHERE user_id = $1 AND email = $2`,
            [user_id, email]
        );

        if (existing.rows.length > 0) {
            return NextResponse.json(
                { success: false, error: 'This email already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 10);

        const result: QueryResult = await db.query(
            `INSERT INTO employees 
            (user_id, employee_id, name, email, contact, department, role, status, password)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING id`,
            [user_id, employee_id, name, email, contact, department, role, status, hashedPassword]
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Employee created successfully',
                employeeId: result.rows[0]?.id ?? null
            },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to create employee' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const db = await connectionToDatabase();

        let result: QueryResult;

        if (user_id) {
            result = await db.query(`SELECT * FROM employees WHERE user_id = $1`, [user_id]);

            if (result.rows.length == 0) {
                return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
            }

        } else {
            result = await db.query(`SELECT * FROM employees`);
        }

        return NextResponse.json({ success: true, data: result.rows }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { id, employee_id, name, email, contact, department, role, status } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: "Employee ID is required" }, { status: 400 });
        }

        const db = await connectionToDatabase();

        const existing = await db.query(`SELECT * FROM employees WHERE id = $1`, [id]);
        if (existing.rows.length == 0) {
            return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
        }

        const result = await db.query(
            `UPDATE employees 
             SET employee_id=$1, name=$2, email=$3, contact=$4, department=$5, role=$6, status=$7
             WHERE id=$8`,
            [employee_id, name, email, contact, department, role, status, id]
        );

        return (result.rowCount ?? 0) == 1
            ? NextResponse.json({ success: true, message: 'Employee updated successfully' }, { status: 200 })
            : NextResponse.json({ success: false, message: 'Failed to update employee' }, { status: 500 });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to update employee' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: "Employee ID is required" }, { status: 400 });
        }

        const db = await connectionToDatabase();

        const existing = await db.query(`SELECT * FROM employees WHERE id = $1`, [id]);
        if (existing.rows.length == 0) {
            return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
        }

        const result = await db.query(`DELETE FROM employees WHERE id = $1`, [id]);

        return (result.rowCount ?? 0) == 1
            ? NextResponse.json({ success: true, message: 'Employee deleted successfully' }, { status: 200 })
            : NextResponse.json({ success: false, message: 'Failed to delete employee' }, { status: 500 });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to delete employee' },
            { status: 500 }
        );
    }
}
