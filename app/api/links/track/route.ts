import { NextRequest, NextResponse } from "next/server";
import { recordClick, recordVisit } from "app/lib/metrics";
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
    await recordVisit(body.firstVisit === true);
    return new NextResponse(null, { status: 204 });
  }

  if (body.type === "click") {
    if (typeof body.id !== "string") {
      return NextResponse.json({ error: "Unknown link id" }, { status: 400 });
    }

    // Ids are checked against the live config, so only links that actually
    // exist can create counter keys. Without this, anyone could POST junk and
    // grow the store without bound. Group destinations post the composite form
    // "<parent>:<child>" — accepted here iff both halves exist.
    const { links } = await readConfig();
    const [parentId, childId] = body.id.split(":", 2);
    const parent = links.find((link) => link.id === parentId);
    const known = parent
      ? childId
        ? parent.children?.some((child) => child.id === childId) === true
        : true
      : false;
    if (!known) {
      return NextResponse.json({ error: "Unknown link id" }, { status: 400 });
    }

    await recordClick(body.id);
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
}
