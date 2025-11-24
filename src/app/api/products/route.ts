import { connectionToDatabase } from '@/src/util/db';
import { NextRequest, NextResponse } from 'next/server';
import { QueryResult, PoolClient } from 'pg';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const products = body.products;

        if (!Array.isArray(products)) {
            return NextResponse.json(
                { success: false, error: 'Expected an array of products' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();
        const values: any[] = [];
        const placeholders: string[] = [];
        let index = 1;

        for (const product of products) {
            const {
                user_id,
                product_id,
                name,
                description,
                price,
                category,
                stock,
                unit,
                attribute
            } = product;

            if (!user_id || !product_id || !name || !price || !category || stock == null || !unit) {
                return NextResponse.json(
                    { success: false, error: 'Missing required fields' },
                    { status: 400 }
                );
            }

            placeholders.push(
                `($${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++})`
            );

            values.push(
                user_id,
                product_id,
                name,
                description || '',
                Number(price),
                category,
                stock,
                unit,
                Array.isArray(attribute) ? JSON.stringify(attribute) : '[]'
            );
        }

        const result: QueryResult = await db.query(
            `INSERT INTO products
            (user_id, product_id, name, description, price, category, stock, unit, attribute)
            VALUES ${placeholders.join(', ')}`,
            values
        );

        return NextResponse.json(
            { success: true, message: `${result.rowCount ?? 0} product(s) created` },
            { status: 201 }
        );
    } catch (error) {
        console.error('[POST /api/products]', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Database error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const db = await connectionToDatabase();

        if (user_id) {
            const result: QueryResult = await db.query(
                `SELECT * FROM products WHERE user_id = $1`,
                [user_id]
            );

            if (result.rows.length == 0) {
                return NextResponse.json(
                    { success: false, message: 'Product not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: result.rows },
                { status: 200 }
            );
        }

        const result: QueryResult = await db.query(`SELECT * FROM products`);

        return NextResponse.json(
            { success: true, data: result.rows },
            { status: 200 }
        );
    } catch (error) {
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

export async function PUT(request: NextRequest) {
    const db = await connectionToDatabase();
    let client: PoolClient | null = null;

    try {
        const rawBody = await request.text();
        let products = JSON.parse(rawBody);
        if (!Array.isArray(products)) products = [products];

        if (products.length == 0) {
            return NextResponse.json(
                { success: false, message: 'No products provided' },
                { status: 400 }
            );
        }

        client = await db.connect();
        await client.query('BEGIN');

        for (const product of products) {
            const {
                product_id,
                name,
                description,
                price,
                category,
                unit,
                attribute
            } = product;

            if (!product_id || !name || !price || !category || !unit) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { success: false, message: `Missing required fields for ${product_id}` },
                    { status: 400 }
                );
            }

            const exists = await client.query(
                `SELECT product_id FROM products WHERE product_id = $1 FOR UPDATE`,
                [product_id]
            );

            if (exists.rows.length == 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { success: false, message: `Product not found: ${product_id}` },
                    { status: 404 }
                );
            }

            const result = await client.query(
                `UPDATE products SET
                    name = $1,
                    description = $2,
                    price = $3,
                    category = $4,
                    unit = $5,
                    attribute = $6
                 WHERE product_id = $7`,
                [
                    name.trim(),
                    description?.trim() || null,
                    Number(price),
                    category.trim(),
                    unit.trim(),
                    Array.isArray(attribute) ? JSON.stringify(attribute) : null,
                    product_id
                ]
            );

            if ((result.rowCount ?? 0) < 1) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { success: false, message: `Failed to update ${product_id}` },
                    { status: 400 }
                );
            }
        }

        await client.query('COMMIT');

        return NextResponse.json(
            { success: true, message: 'Product(s) updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Product update error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update product(s)' },
            { status: 500 }
        );
    } finally {
        if (client) client.release();
    }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, product_id } = await request.json();
    const db = await connectionToDatabase();

    if (!id && !product_id) {
      return NextResponse.json(
        { success: false, message: "id or product_id is required" },
        { status: 400 }
      );
    }

    if (id) {
      const result = await db.query(
        `DELETE FROM products WHERE id = $1`,
        [id]
      );

      return (result.rowCount ?? 0) === 1
        ? NextResponse.json({ success: true, message: "Product deleted" })
        : NextResponse.json(
            { success: false, message: "Product not found" },
            { status: 404 }
          );
    }

    if (Array.isArray(product_id)) {
      const countMap: Record<string, number> = {};

      for (const pid of product_id) {
        countMap[pid] = (countMap[pid] || 0) + 1;
      }

      let totalDeleted = 0;

      for (const pid in countMap) {
        const qty = countMap[pid];

        const result = await db.query(
          `
          DELETE FROM products
          WHERE id IN (
            SELECT id FROM products
            WHERE product_id = $1
            LIMIT $2
          )
          `,
          [pid, qty]
        );

        totalDeleted += result.rowCount ?? 0;
      }

      return totalDeleted > 0
        ? NextResponse.json({
            success: true,
            message: `${totalDeleted} product(s) deleted`,
          })
        : NextResponse.json(
            { success: false, message: "No products found to delete" },
            { status: 404 }
          );
    }

    if (typeof product_id === "string") {
      const result = await db.query(
        `DELETE FROM products WHERE product_id = $1`,
        [product_id]
      );

      return (result.rowCount ?? 0) > 0
        ? NextResponse.json({
            success: true,
            message: `${result.rowCount} product(s) deleted`,
          })
        : NextResponse.json(
            { success: false, message: "No products found" },
            { status: 404 }
          );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Product delete failed",
      },
      { status: 500 }
    );
  }
}