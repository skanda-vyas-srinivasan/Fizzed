import { NextRequest, NextResponse } from "next/server";

const allowedHosts = new Set(["static.wikia.nocookie.net"]);

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url");
  if (!source) return new NextResponse("Missing image URL", { status: 400 });

  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return new NextResponse("Invalid image URL", { status: 400 });
  }

  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) {
    return new NextResponse("Image host not allowed", { status: 400 });
  }

  const response = await fetch(url, {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "User-Agent": "Fizzed/0.1 image proxy"
    },
    next: { revalidate: 60 * 60 * 24 * 30 }
  });

  if (!response.ok) return new NextResponse("Image unavailable", { status: response.status });

  return new NextResponse(response.body, {
    headers: {
      "Cache-Control": "public, max-age=2592000, immutable",
      "Content-Type": response.headers.get("content-type") || "image/webp"
    }
  });
}
