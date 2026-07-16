"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  clearRateLimit,
  createSessionToken,
  isConfigured,
  rateLimit,
  sessionCookieOptions,
  verifyPassword,
} from "app/lib/admin-auth";

export type LoginState = { error?: string };

async function clientIp(): Promise<string> {
  const head = await headers();
  return (
    head.get("x-nf-client-connection-ip") ??
    head.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isConfigured()) {
    return { error: "Admin is not configured: ADMIN_PASSWORD is not set." };
  }

  const ip = await clientIp();
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return { error: `Too many attempts. Try again in ${limit.retryInMin} min.` };
  }

  if (!verifyPassword(String(formData.get("password") ?? ""))) {
    return { error: "Wrong password." };
  }

  clearRateLimit(ip);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions);

  redirect("/admin/stats");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/stats");
}
