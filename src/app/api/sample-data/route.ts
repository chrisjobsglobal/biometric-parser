import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "sample-data", "biometric-log.csv");
    const csvContent = await fs.readFile(filePath, "utf-8");
    
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load sample data" },
      { status: 500 }
    );
  }
}
