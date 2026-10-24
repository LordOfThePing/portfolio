import { NextRequest, NextResponse } from "next/server";
import { recordClick, recordVisit } from "app/lib/metrics";
import { findList, readConfig } from "app/lib/links-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  type?: unknown;
  id?: unknown;
  firstVisit?: unknown;
  /** Custom list id when the event comes from /links/<list>. */
  list?: unknown;
};

export async function POST(request: NextRequest) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const listId = typeof body.list === "string" && body.list ? body.list : undefined;

  if (body.type === "visit") {
    // Same reasoning as click ids below: only real lists can create keys.
    if (listId && !findList(await readConfig(), listId)) {
      return NextResponse.json({ error: "Unknown list" }, { status: 400 });
    }
    await recordVisit(body.firstVisit === true, listId);
    return new NextResponse(null, { status: 204 });
  }

  if (body.type === "click") {
    if (typeof body.id !== "string") {
      return NextResponse.json({ error: "Unknown link id" }, { status: 400 });
    }

    // Ids are checked against the live config, so only links that actually
    // exist can create counter keys. Without this, anyone could POST junk and
    // grow the store without bound. Group destinations post the composite form
    // "<parent>:<child>" — accepted here iff both halves exist. A custom list's
    // clicks are checked against that list's own links.
    const config = await readConfig();
    const list = listId ? findList(config, listId) : undefined;
    if (listId && !list) {
      return NextResponse.json({ error: "Unknown list" }, { status: 400 });
    }
    const { links } = list ?? config;
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

    await recordClick(body.id, listId);
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
}
