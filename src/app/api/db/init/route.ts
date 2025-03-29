import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import { sqlConfig } from '@/lib/db-config';

export async function GET(request: NextRequest) {
  try {
    // Read SQL script file
    const scriptPath = path.join(process.cwd(), 'src', 'sql', 'create-tables.sql');
    const sqlScript = fs.readFileSync(scriptPath, 'utf8');

    // Connect to database
    const pool = await sql.connect(sqlConfig);

    // Split the script into individual batches based on GO statements
    const batches = sqlScript.split(/^\s*GO\s*$/m);

    // Execute each batch
    for (const batch of batches) {
      if (batch.trim()) {
        await pool.request().query(batch);
      }
    }

    await pool.close();

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing database:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to initialize database', error: String(error) },
      { status: 500 }
    );
  }
}
