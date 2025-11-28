import { NextRequest, NextResponse } from 'next/server';
import { connectionToDatabase } from '@/src/util/db';

export async function POST(request: NextRequest) {
  try {
    const { user_id, customer_id, name, delivery, email, contact, status } =
      await request.json();

    if (!user_id || !customer_id || !name || !delivery || !email || !contact) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await connectionToDatabase();

    const result = await db.query(
      `INSERT INTO customers (user_id, customer_id, name, delivery, email, contact, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [user_id, customer_id, name, delivery, email, contact, status]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Customer created successfully',
        customerId: result.rows[0].id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /customers error:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to create customer',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    const db = await connectionToDatabase();

    let result;
    if (user_id) {
      result = await db.query(`SELECT * FROM customers WHERE user_id = $1`, [user_id]);
      if (result.rows.length == 0) {
        return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
      }
    } else {
      result = await db.query(`SELECT * FROM customers`);
    }

    return NextResponse.json({ success: true, data: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, customer_id, name, delivery, email, contact, status } = await request.json();

    const db = await connectionToDatabase();

    const existing = await db.query(`SELECT * FROM customers WHERE id = $1`, [id]);
    if (existing.rows.length == 0) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    const result = await db.query(
      `UPDATE customers
       SET customer_id=$1, name=$2, delivery=$3, email=$4, contact=$5, status=$6
       WHERE id=$7`,
      [customer_id, name, delivery, email, contact, status, id]
    );

    if (result.rowCount == 1) {
      return NextResponse.json({ success: true, message: 'Customer updated successfully' }, { status: 200 });
    } else {
      throw new Error('Failed to update customer');
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Customer ID is required' }, { status: 400 });
    }

    const db = await connectionToDatabase();

    const existing = await db.query(`SELECT * FROM customers WHERE id = $1`, [id]);
    if (existing.rows.length == 0) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    const result = await db.query(`DELETE FROM customers WHERE id = $1`, [id]);
    if (result.rowCount == 1) {
      return NextResponse.json({ success: true, message: 'Customer deleted successfully' }, { status: 200 });
    } else {
      throw new Error('Failed to delete customer');
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
