import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: "Database connection successful" }, { status: 200 });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ error: "Database connection failed", details: error.message }, { status: 500 });
  }
} 