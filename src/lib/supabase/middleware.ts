import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import {
  hasLogiAppAccess,
  isLogiOsAdmin,
  isLogiPollCreator,
} from "@/lib/logi-app-access";

export async function updateSession(request: NextRequest) {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPath = pathname === "/login";
  const isAuthCallbackPath = pathname.startsWith("/auth");

  if (pathname === "/kein-zugang") {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", "/kein-zugang");
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  if (!user) {
    if (isLoginPath || isAuthCallbackPath) {
      return supabaseResponse;
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthCallbackPath) {
    return supabaseResponse;
  }

  const [{ data: access }, { data: profile }] = await Promise.all([
    supabase
      .from("logi_user_access")
      .select("team, is_admin")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);

  const profileRole = profile?.role ?? null;
  const canUseApp = hasLogiAppAccess(access ?? null, profileRole);

  if (!canUseApp) {
    if (isLoginPath) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/kein-zugang";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/kein-zugang";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // Abstimmungen nur auf dem Dashboard; /polls/new bleibt für Admins (Erstellung).
  if (
    pathname === "/polls" ||
    (pathname.startsWith("/polls/") && !pathname.startsWith("/polls/new"))
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (
    pathname.startsWith("/polls/new") &&
    !isLogiPollCreator(access ?? null, profileRole)
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/admin") && !isLogiOsAdmin(access ?? null, profileRole)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
