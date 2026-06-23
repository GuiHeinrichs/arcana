import type { NextRequest } from "next/server";
import { parseCardQuery, searchCards } from "@/lib/ygoprodeck";

/**
 * Same-origin pagination endpoint. The browser grid loads further pages
 * through here so the rate-limited, CORS-less YGOPRODeck call stays on the
 * server and behind Next's data cache.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const query = parseCardQuery((key) => sp.get(key));
  const offset = Number.parseInt(sp.get("offset") ?? "0", 10);

  try {
    const page = await searchCards(
      query,
      Number.isFinite(offset) ? offset : 0,
    );
    return Response.json(page, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=86400" },
    });
  } catch {
    return Response.json(
      { error: "Could not reach the card library." },
      { status: 502 },
    );
  }
}
