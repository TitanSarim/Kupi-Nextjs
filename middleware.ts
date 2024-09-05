import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { secureRoutes } from "@/secureRoutes";

export async function middleware(req: NextRequest) {
  const session = await auth().catch(() => null) ?? null;

  const url = req.nextUrl.clone();
  const path = url.pathname;

  if (secureRoutes.includes(path) && !session) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
