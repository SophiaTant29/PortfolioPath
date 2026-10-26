import { NextResponse, type NextRequest } from "next/server";

// Public learning mode: authentication is not required to browse PortfolioPath.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
