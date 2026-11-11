import { NextResponse, type NextRequest } from "next/server";

/**
 * Optional server-side password gate (HTTP Basic auth).
 * Set SITE_PASSWORD in Vercel → Project → Settings → Environment Variables to enable.
 * When unset, the site is open to anyone with the link. This is real access control:
 * the check runs on the server and the password never ships in frontend code.
 */
export function proxy(req: NextRequest) {
  const pass = process.env.SITE_PASSWORD;
  if (!pass) return NextResponse.next();
  const h = req.headers.get("authorization");
  if (h?.startsWith("Basic ")) {
    try {
      const [, p] = atob(h.slice(6)).split(/:(.*)/s);
      if (p === pass) return NextResponse.next();
    } catch { /* fall through */ }
  }
  return new NextResponse("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Project Ammu"' } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
