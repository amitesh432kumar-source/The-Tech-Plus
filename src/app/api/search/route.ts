import { NextResponse, type NextRequest } from "next/server";
import { searchAll } from "@/services/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchAll(q, 4);
  return NextResponse.json({ results });
}
