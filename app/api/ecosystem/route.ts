import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "20");
  const page = parseInt(searchParams.get("page") || "1");

  try {
    const where = type ? { type } : {};
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      prisma.ecosystemMember.findMany({
        where,
        take: limit,
        skip,
        orderBy: { isVerified: 'desc' },
      }),
      prisma.ecosystemMember.count({ where }),
    ]);

    return NextResponse.json({
      members,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
