import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { secureRoutes } from "@/secureRoutes";

export async function middleware(req: NextRequest) {
  const session = (await auth().catch(() => null)) ?? null;

  const url = req.nextUrl.clone();
  const path = url.pathname;
  const role = session?.role;

  if (secureRoutes.includes(path) && !session) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/app/bus-operators") && role !== "SuperAdmin") {
    url.pathname = "/app/profile";
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/app/settings/admin") && role !== "SuperAdmin") {
    url.pathname = "/app/settings/operator";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
