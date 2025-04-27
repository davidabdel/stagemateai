import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
 
export function middleware(request: NextRequest) {
  // Your custom middleware logic here
  return NextResponse.next();
}
 
// See https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: [
    // Exclude files with extensions, api routes, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)" 
  ],
};
