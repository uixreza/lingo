import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");
  cookieStore.delete("__Host-next-auth.session-token");
  cookieStore.delete("next-auth.csrf-token");
  cookieStore.delete("next-auth.callback-url");
  const home = new URL("/", _request.url);
  home.searchParams.set("banned", "1");
  return NextResponse.redirect(home);
}