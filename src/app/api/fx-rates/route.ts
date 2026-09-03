import { fetchLiveRates } from "@/lib/fx";

export const runtime = "nodejs";
export const revalidate = 21600; // 6 hours

export async function GET() {
  const rates = await fetchLiveRates();
  return Response.json(rates, {
    headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600" },
  });
}
