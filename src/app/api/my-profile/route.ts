import path from 'path';
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { connectionToDatabase } from '@/src/util/db';
import jwt from 'jsonwebtoken';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET as string;
if (!NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not defined in the environment variables.');
}

export async function PUT(request: NextRequest) {
    let db;
    try {
        const data = await request.formData();
        const formDataString = data.get('data');
        const formFields = JSON.parse(formDataString as string);

        const {
            id, name, last_name, contact, company, address
        } = formFields;

        const image = data.get('image') as File;
        let imagePost: string | null = null;

        if (image && image.size > 0) {
            const imageBuffer = Buffer.from(await image.arrayBuffer());
            const imageFile = image.name;

            await writeFile(
                path.join(process.cwd(), 'public/uploads/images', imageFile),
                imageBuffer
            );

            imagePost = `/api/uploads/images/${imageFile}`;
        }

        const logo = data.get('logo') as File;
        let logoPost: string | null = null;

        if (logo && logo.size > 0) {
            const logoBuffer = Buffer.from(await logo.arrayBuffer());
            const logoFile = logo.name;

            await writeFile(
                path.join(process.cwd(), 'public/uploads/logos', logoFile),
                logoBuffer
            );

            logoPost = `/api/uploads/logos/${logoFile}`;
        }

        db = await connectionToDatabase();

        const setParts: string[] = [];
        const params: any[] = [];
        let idx = 1;

        setParts.push(`name = $${idx++}`); params.push(name);
        setParts.push(`last_name = $${idx++}`); params.push(last_name);
        setParts.push(`contact = $${idx++}`); params.push(contact);
        setParts.push(`company = $${idx++}`); params.push(company);
        setParts.push(`address = $${idx++}`); params.push(address);

        if (imagePost) {
            setParts.push(`image = $${idx++}`);
            params.push(imagePost);
        }

        if (logoPost) {
            setParts.push(`logo = $${idx++}`);
            params.push(logoPost);
        }

        params.push(id);

        const updateQuery = `
            UPDATE admin
            SET ${setParts.join(', ')}
            WHERE id = $${idx}
        `;

        const updateResult = await db.query(updateQuery, params);

        if (updateResult.rowCount !== 1) {
            throw new Error('Failed to update admin');
        }

        const userResult = await db.query(
            'SELECT * FROM admin WHERE id = $1',
            [id]
        );

        if (userResult.rows.length == 0) {
            throw new Error('User not found after update');
        }

        const admin = userResult.rows[0];

        const token = jwt.sign(
            {
                id: admin.id,
                name: admin.name,
                last_name: admin.last_name,
                email: admin.email,
                contact: admin.contact,
                company: admin.company,
                logo: admin.logo,
                address: admin.address,
                role: admin.role,
                image: admin.image
            },
            NEXTAUTH_SECRET,
            { expiresIn: '1h' }
        );

        return NextResponse.json(
            {
                success: true,
                message: 'User updated successfully',
                token,
                admin,
                image: imagePost,
                logo: logoPost
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update admin'
            },
            { status: 500 }
        );
    } finally {
        if (db) {
            db.end(); // IMPORTANT for pg Pool
        }
    }
}
