"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  clearRateLimit,
  createSessionToken,
  isAdmin,
  isConfigured,
  rateLimit,
  sessionCookieOptions,
  verifyCredentials,
} from "app/lib/admin-auth";
import {
  clearConfig,
  defaultConfig,
  validateConfig,
  writeConfig,
  type LinksConfig,
} from "app/lib/links-store";

export type LoginState = { error?: string };
export type SaveState = { errors?: string[]; savedAt?: number };

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
    return { error: "Admin is not configured: ADMIN_USER / ADMIN_PASSWORD are not set." };
  }

  const ip = await clientIp();
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return { error: `Too many attempts. Try again in ${limit.retryInMin} min.` };
  }

  const user = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  // One generic message on purpose: saying which half was wrong would confirm
  // a valid username to someone guessing.
  if (!verifyCredentials(user, password)) {
    return { error: "Wrong username or password." };
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

/**
 * Saves the Linktree config. Re-checks the session because a server action is a
 * public endpoint — the layout gating the page does not protect this.
 */
export async function saveConfig(input: LinksConfig): Promise<SaveState> {
  if (!(await isAdmin())) return { errors: ["Session expired. Log in again."] };

  const { config, errors } = validateConfig(input);
  if (errors.length) return { errors };

  try {
    await writeConfig(config);
  } catch (error) {
    console.error("[admin] failed to save config:", error);
    return { errors: [`Could not save: ${error}`] };
  }

  revalidatePath("/links");
  revalidatePath("/admin/config");
  return { savedAt: Date.now() };
}

/** Drops the saved config so /links falls back to links-config.ts. */
export async function resetConfig(): Promise<SaveState> {
  if (!(await isAdmin())) return { errors: ["Session expired. Log in again."] };

  try {
    await clearConfig();
  } catch (error) {
    console.error("[admin] failed to reset config:", error);
    return { errors: [`Could not reset: ${error}`] };
  }

  revalidatePath("/links");
  revalidatePath("/admin/config");
  return { savedAt: Date.now() };
}

export async function getDefaultConfig(): Promise<LinksConfig> {
  return defaultConfig();
}
