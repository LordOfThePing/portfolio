import { NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";
import { isAdmin } from "app/lib/admin-auth";
import { readRange, utcDay, utcDayAgo } from "app/lib/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY admin-only diagnostics for the /links metrics store.
 *
 * The metrics + config code deliberately swallows Netlify Blobs errors so a
 * failed write never breaks a click (see app/lib/metrics.ts). That also hides
 * *why* the Stats page reads 0. This endpoint does a real write→read→list
 * roundtrip against Blobs and returns the actual error instead of swallowing
 * it. Delete this route once the metrics issue is resolved.
 */

function describe(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { name: "Unknown", message: String(error) };
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const result: Record<string, unknown> = {
    now: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV ?? null,
      // Presence only — never the values. These are what the Netlify Next.js
      // runtime injects to auto-wire Blobs; if they're missing, getStore throws.
      hasNETLIFY: Boolean(process.env.NETLIFY),
      hasBlobsContext: Boolean(process.env.NETLIFY_BLOBS_CONTEXT),
      siteId: process.env.SITE_ID ? "set" : "missing",
      region: process.env.AWS_REGION ?? process.env.NETLIFY_REGION ?? null,
    },
  };

  const key = `__diag__${Date.now()}`;
  const value = String(Date.now());

  try {
    const store = getStore({ name: "linktree-metrics", consistency: "strong" });

    await store.set(key, value);
    result.write = "ok";

    const readBack = await store.get(key, { type: "text" });
    result.read = readBack === value ? "ok (matched)" : `mismatch: ${readBack}`;

    const { blobs } = await store.list();
    // The ACTUAL keys in the store (minus our own probe key). This shows the
    // exact format the writer produced — bucketed "YYYY-MM-DD#metric" or not.
    result.keys = blobs
      .map((b) => b.key)
      .filter((k) => !k.startsWith("__diag__"))
      .sort();

    await store.delete(key);
    result.cleanup = "ok";

    // Run the EXACT aggregation the Stats page uses, so we see what it sees.
    const today = utcDay();
    result.readRange = {
      allTime: await readRange(null, today),
      today: await readRange(today, today),
      last7d: await readRange(utcDayAgo(6), today),
      to: today,
    };

    result.verdict =
      "Blobs is WORKING. Compare `keys` (what's stored) with `readRange` (what Stats computes).";
  } catch (error) {
    result.verdict = "Blobs FAILED — this is why every counter reads 0.";
    result.error = describe(error);
  }

  return NextResponse.json(result, { status: 200 });
}
