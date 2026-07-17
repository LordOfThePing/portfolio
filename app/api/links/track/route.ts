import { NextRequest, NextResponse } from "next/server";
import { increment, KEY } from "app/lib/metrics";
import { readConfig } from "app/lib/links-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  type?: unknown;
  id?: unknown;
  firstVisit?: unknown;
};

export async function POST(request: NextRequest) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.type === "visit") {
    const keys: string[] = [KEY.visits];
    if (body.firstVisit === true) keys.push(KEY.visitors);
    await increment(keys);
    return new NextResponse(null, { status: 204 });
  }

  if (body.type === "click") {
    if (typeof body.id !== "string") {
      return NextResponse.json({ error: "Unknown link id" }, { status: 400 });
    }

    // Ids are checked against the live config, so only links that actually
    // exist can create counter keys. Without this, anyone could POST junk and
    // grow the store without bound.
    const { links } = await readConfig();
    if (!links.some((link) => link.id === body.id)) {
      return NextResponse.json({ error: "Unknown link id" }, { status: 400 });
    }

    await increment([KEY.click(body.id)]);
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
}
