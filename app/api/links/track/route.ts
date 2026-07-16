import { NextRequest, NextResponse } from "next/server";
import { increment, KEY } from "app/lib/metrics";
import { links } from "app/links-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Only ids that exist in the config may become counter keys. */
const knownIds = new Set(links.map((link) => link.id));

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
    // Reject unknown ids, otherwise anyone could POST junk and grow the store.
    if (typeof body.id !== "string" || !knownIds.has(body.id)) {
      return NextResponse.json({ error: "Unknown link id" }, { status: 400 });
    }
    await increment([KEY.click(body.id)]);
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
}
