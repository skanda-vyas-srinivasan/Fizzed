import { NextResponse } from "next/server";
import { ensureSodasSeeded } from "@/lib/seed";

export async function POST() {
  const result = await ensureSodasSeeded();
  return NextResponse.json(result);
}
