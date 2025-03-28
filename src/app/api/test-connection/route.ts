import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/lib/db-config';

export async function GET(request: NextRequest) {
  let pool = null;

  try {
    // Try to connect to the database
    pool = await sql.connect(sqlConfig);

    // Simple query to test connection
    const result = await pool.request().query('SELECT @@VERSION as version');

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to the SQL Server database',
      version: result.recordset[0].version
    });
  } catch (error) {
    console.error('Database connection error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to the SQL Server database',
        error: String(error)
      },
      { status: 500 }
    );
  } finally {
    // Close the connection
    if (pool) {
      await pool.close();
    }
  }
}
