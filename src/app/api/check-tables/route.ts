import { NextResponse } from "next/server";
import { testConnection, checkTables, getTableInfo } from "@/lib/db";
export async function GET() {
  try {
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
        },
        { status: 500 }
      );
    }
    const tablesResult = await checkTables();
    if (!tablesResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to check tables",
          details: tablesResult.error,
        },
        { status: 500 }
      );
    }
    const tableInfo = await getTableInfo();
    return NextResponse.json({
      success: true,
      connection: "Connected",
      tables: tablesResult.tables,
      counts: tableInfo.success ? tableInfo.counts : null,
      message: "Database check completed successfully",
    });
  } catch (error) {
    console.error("Database check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}